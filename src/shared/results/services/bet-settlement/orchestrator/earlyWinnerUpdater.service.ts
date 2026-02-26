import { Injectable, Logger } from '@nestjs/common';
import { Result, MatchStatus } from '@prisma/client';
import { analyzeVencedorAntecipado } from './../../../../../shared/results/analysis';
import { EventLiveScoreDTO } from './../../../../../shared/thesportsdb-api/schemas/live/eventLiveScore.schema';
import { BetWithExternalMatchDetails } from '../types/betWithExternal.types';
import { PrismaService } from './../../../../../libs/database';
import { BetSettlementService } from '../../betSettlement.service';
import { EventDataResolverService } from '../../eventDataResolver.service';
import { EarlyWinnerEventsAnalyzerService } from './earlyWinnerEventsAnalyzer.service';
import { ValidateEventService } from '../settlement/validateEvent.service';

@Injectable()
export class EarlyWinnerUpdateService {
  private readonly logger = new Logger(EarlyWinnerUpdateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dataResolver: EventDataResolverService,
    private readonly settlementService: BetSettlementService,
    private readonly eventsAnalyzer: EarlyWinnerEventsAnalyzerService,
    private readonly validateEventService: ValidateEventService,
  ) {}

  async updateEarlyWinnerBets(): Promise<number> {
    this.logger.debug(
      '⚡ Updating early-winner bets (market="Resultado Antecipado")',
    );

    const bets: BetWithExternalMatchDetails[] = await this.prisma.bets.findMany(
      {
        where: {
          result: Result.pending,
          market: { contains: 'Resultado Antecipado', mode: 'insensitive' },
          externalMatch: {
            is: {
              status: {
                notIn: [MatchStatus.SCHEDULED, MatchStatus.NOT_STARTED],
              },
            },
          },
        },
        include: {
          externalMatch: {
            include: {
              externalMatchDetails: true,
            },
          },
        },
      },
    );

    if (!bets.length) return 0;

    // ─── Separação inicial ────────────────────────────────────────────
    const withTsdb: BetWithExternalMatchDetails[] = [];
    const finishedWithoutTsdb: BetWithExternalMatchDetails[] = [];
    const waitingTsdb: BetWithExternalMatchDetails[] = [];

    for (const bet of bets) {
      const tsdbEventId = bet.externalMatch?.tsdbEventId;

      if (tsdbEventId) {
        // tem TSDB → pode usar API live se precisar
        withTsdb.push(bet);
      } else if (bet.externalMatch?.status === MatchStatus.FINISHED) {
        // sem TSDB mas já FINISHED → processa pelo DB
        finishedWithoutTsdb.push(bet);
      } else {
        // sem TSDB e não FINISHED → ainda não pode processar
        waitingTsdb.push(bet);
      }
    }

    if (waitingTsdb.length) {
      this.logger.debug(
        `⏳ Skipping ${waitingTsdb.length} early-winner bets: externalMatch.tsdbEventId is null and match not FINISHED`,
      );
    }

    // Se não tem nada pra processar, retorna
    if (!withTsdb.length && !finishedWithoutTsdb.length) return 0;

    // ─── Agrupa por chave (tsdbEventId ou externalMatchId) ───────────
    const betsByKey = new Map<string, BetWithExternalMatchDetails[]>();

    for (const bet of [...withTsdb, ...finishedWithoutTsdb]) {
      const externalMatch = bet.externalMatch;
      const tsdbEventId = externalMatch?.tsdbEventId;

      const key = tsdbEventId
        ? `tsdb:${tsdbEventId}`
        : `ext:${externalMatch.id}`;

      if (!betsByKey.has(key)) betsByKey.set(key, []);
      betsByKey.get(key)!.push(bet);
    }

    // ─── Loop principal ───────────────────────────────────────────────
    let processed = 0;

    for (const [key, eventBets] of betsByKey) {
      const betRef = eventBets[0];
      const externalMatch = betRef.externalMatch;
      const details = externalMatch.externalMatchDetails;

      if (!details) {
        this.logger.warn(
          `No externalMatchDetails for externalMatch ${externalMatch.id}`,
        );
        continue;
      }

      const homeTeamId = details.homeTeamId;
      const awayTeamId = details.awayTeamId;

      const isFinished = externalMatch.status === MatchStatus.FINISHED;

      // ✅ FINISHED → processa pelo DB (não precisa TSDB)
      if (isFinished) {
        const homeScoreFT = externalMatch.homeScoreFT ?? 0;
        const awayScoreFT = externalMatch.awayScoreFT ?? 0;

        this.logger.debug(
          `🏁 Event ${key} FINISHED in DB, analyzing for early winner`,
        );

        for (const bet of eventBets) {
          const shouldAnalyze = this.eventsAnalyzer.shouldAnalyzeEvents(
            bet.selection,
            homeScoreFT,
            awayScoreFT,
          );

          this.logger.debug(
            `Bet ${bet.id} (${bet.selection}): ${shouldAnalyze.reason}`,
          );

          // Caso imediato: ganhou normalmente ou perdeu sem fazer 2 gols
          if (!shouldAnalyze.shouldAnalyze && shouldAnalyze.immediateResult) {
            const eventData: EventLiveScoreDTO = {
              ...bet,
              intHomeScore: homeScoreFT.toString(),
              intAwayScore: awayScoreFT.toString(),
              strStatus: externalMatch.status,
              homeScoreHT: externalMatch.homeScoreHT ?? 0,
              awayScoreHT: externalMatch.awayScoreHT ?? 0,
              homeScoreFT,
              awayScoreFT,
              optionMarket: bet.selection,
            } as EventLiveScoreDTO;

            const settlementAnalysis = {
              shouldUpdate: true,
              result: shouldAnalyze.immediateResult as Result,
              reason: shouldAnalyze.reason,
            };

            await this.settlementService.settleBet(
              bet,
              eventData,
              settlementAnalysis,
            );
            processed++;
            continue;
          }

          // Precisa analisar eventos (empatou/perdeu mas fez 2+ gols)
          const events = this.eventsAnalyzer.extractEventsFromDetails(
            details.events,
          );

          if (events.length === 0) {
            this.logger.warn(
              `No events found for match ${externalMatch.id}, bet ${bet.id}`,
            );
            continue;
          }

          const analysis = this.eventsAnalyzer.analyzeEarlyWinner(
            events,
            homeTeamId,
            awayTeamId,
          );

          const betCheck = this.eventsAnalyzer.checkBetEarlyWinner(
            bet.selection,
            analysis,
          );

          this.logger.debug(
            `Bet ${bet.id} events analysis: ${betCheck.isWinner ? '✅ WIN' : '❌ LOSE'} - ${betCheck.reason}`,
          );

          const eventData: EventLiveScoreDTO = {
            ...bet,
            intHomeScore: homeScoreFT.toString(),
            intAwayScore: awayScoreFT.toString(),
            strStatus: externalMatch.status,
            homeScoreHT: externalMatch.homeScoreHT ?? 0,
            awayScoreHT: externalMatch.awayScoreHT ?? 0,
            homeScoreFT,
            awayScoreFT,
            optionMarket: bet.selection,
          } as EventLiveScoreDTO;

          const settlementAnalysis = {
            shouldUpdate: true,
            result: betCheck.isWinner ? Result.win : Result.lose,
            reason: betCheck.reason,
          };

          await this.settlementService.settleBet(
            bet,
            eventData,
            settlementAnalysis,
          );
          processed++;
        }

        continue; // próximo grupo
      }

      // ─── NÃO finished → precisa TSDB pra buscar dados live ─────────
      const tsdbEventId = externalMatch.tsdbEventId;
      if (!tsdbEventId) {
        // Não deveria chegar aqui (filtrado na separação inicial),
        // mas mantém o guard por segurança
        this.logger.debug(
          `⏳ Skipping early-winner bets for ${key}: no TSDB ID and match not FINISHED`,
        );
        continue;
      }

      const resolved = await this.dataResolver.resolveEventData(
        betRef.sport,
        tsdbEventId,
      );

      if (!resolved) {
        this.logger.debug(`No data found for event ${tsdbEventId}`);
        continue;
      }

      const { event: liveEvent, canonicalStatus } = resolved;

      const isOngoing =
        canonicalStatus === MatchStatus.LIVE ||
        canonicalStatus === MatchStatus.FIRST_HALF ||
        canonicalStatus === MatchStatus.HALF_TIME ||
        canonicalStatus === MatchStatus.SECOND_HALF;

      const isNotStarted =
        canonicalStatus === MatchStatus.NOT_STARTED ||
        canonicalStatus === MatchStatus.SCHEDULED;

      if (!isOngoing && !isNotStarted) {
        this.logger.debug(
          `Event ${tsdbEventId} is ${canonicalStatus}, skipping early-winner check`,
        );
        continue;
      }

      const homeTeam = liveEvent.strHomeTeam;
      const awayTeam = liveEvent.strAwayTeam;
      const homeScore = Number(liveEvent.intHomeScore ?? 0);
      const awayScore = Number(liveEvent.intAwayScore ?? 0);

      this.logger.debug(
        `📊 Event ${tsdbEventId} status: ${canonicalStatus} | ${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`,
      );

      const results = await Promise.allSettled(
        eventBets.map(async (bet) => {
          const eventData: EventLiveScoreDTO = {
            ...bet,
            intHomeScore: homeScore.toString(),
            intAwayScore: awayScore.toString(),
            strStatus: canonicalStatus,
            homeScoreHT: 0,
            awayScoreHT: 0,
            homeScoreFT: homeScore,
            awayScoreFT: awayScore,
            optionMarket: bet.selection,
          } as EventLiveScoreDTO;

          const validation =
            this.validateEventService.validateEventData(eventData);

          if (!validation.isValid) {
            this.logger.debug(
              `Bet ${bet.id} validation failed: ${validation.reason}`,
            );
            return 0;
          }

          const analysis = analyzeVencedorAntecipado(
            bet.selection,
            homeScore,
            awayScore,
            canonicalStatus,
          );

          this.logger.debug(
            `Analyzing bet ${bet.id}: market="${bet.market}", selection="${bet.selection}", ` +
              `${homeTeam} ${homeScore}-${awayScore} ${awayTeam}, shouldUpdate=${analysis.shouldUpdate}`,
          );

          if (!analysis.shouldUpdate) return 0;

          const settled = await this.settlementService.settleBet(
            bet,
            eventData,
            analysis,
          );

          return settled ? 1 : 0;
        }),
      );

      processed += results.reduce((sum, r) => {
        if (r.status === 'fulfilled') return sum + r.value;
        // opcional: logar erro do Promise rejeitado
        this.logger.warn(
          `Early-winner bet processing failed: ${String(r.reason)}`,
        );
        return sum;
      }, 0);
    }

    return processed;
  }
}
