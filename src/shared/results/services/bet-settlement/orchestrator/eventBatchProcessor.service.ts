import { Injectable, Logger } from '@nestjs/common';
import { BetWithExternalMatch } from '../types/betWithExternal.types';
import { EventDataResolverService } from '../../eventDataResolver.service';
import {
  createStats,
  SettlementStats,
} from './../../../../../shared/results/interfaces/betSettleOrch.interface';
import { MatchStatus } from '@prisma/client';
import { CancelledHandlerService } from './cancelledHandler.service';
import { ExternalMatchSyncService } from './externalMatchSync.service';
import { SingleBetService } from './singleBetProcessor.service';
import { StatsUpdateService } from './statsUpdater.service';
import { PrismaService } from './../../../../../libs/database/prisma/prisma.service';

@Injectable()
export class EventBatchProcessorService {
  private readonly logger = new Logger(EventBatchProcessorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dataResolver: EventDataResolverService,
    private readonly cancelledHandler: CancelledHandlerService,
    private readonly externalMatch: ExternalMatchSyncService,
    private readonly singleBet: SingleBetService,
    private readonly statsUpdate: StatsUpdateService,
  ) {}

  async processEventBatch(
    eventKey: string,
    bets: BetWithExternalMatch[],
  ): Promise<SettlementStats> {
    const stats = createStats();
    const betRef = bets[0];

    try {
      // ========================================
      // 0️⃣ SHORT-CIRCUIT: se já FINALIZADO no DB (API-Sports lock)
      // ========================================
      const em = betRef.externalMatch;

      const isDbFinishedByApiSports =
        em?.status === MatchStatus.FINISHED && em?.apiSource === 'api-sports';

      if (isDbFinishedByApiSports) {
        const homeScore = em.homeScoreFT ?? 0;
        const awayScore = em.awayScoreFT ?? 0;
        const homeScoreHT = em.homeScoreHT ?? 0;
        const awayScoreHT = em.awayScoreHT ?? 0;

        this.logger.debug(
          `🔒 DB already FINISHED (api-sports). Skipping TSDB. ` +
            `externalMatchId=${em.id} | FT=${homeScore}-${awayScore} | HT=${homeScoreHT}-${awayScoreHT}`,
        );

        const results = await Promise.allSettled(
          bets.map((bet) =>
            this.singleBet.settleSingleBet(bet, {
              homeScore,
              awayScore,
              homeScoreHT,
              awayScoreHT,
              canonicalStatus: MatchStatus.FINISHED,
            }),
          ),
        );

        return this.statsUpdate.updateStats(results, stats, bets);
      }

      // ========================================
      // 1️⃣ VALIDAÇÃO: Sem tsdbEventId → Pula (aguarda fluxo externalMatch)
      // ========================================
      const tsdbEventId =
        betRef.tsdbEventId ?? betRef.externalMatch?.tsdbEventId;

      if (!tsdbEventId) {
        this.logger.debug(
          `⏭️ Skipping ${eventKey} - No TSDB ID. Will be handled by external_matches flow.`,
        );
        stats.skipped += bets.length;
        return stats;
      }

      // ========================================
      // 2️⃣ BUSCA STATUS ATUALIZADO NA API (TSDB)
      // ========================================
      this.logger.debug(
        `🔍 Fetching live data for event ${eventKey} (TSDB: ${tsdbEventId})`,
      );

      const resolvedData = await this.dataResolver.resolveEventData(
        betRef.sport,
        tsdbEventId,
      );

      if (!resolvedData) {
        this.logger.warn(`❌ Event ${eventKey} not found in API`);
        stats.skipped += bets.length;
        return stats;
      }

      const { event: liveEvent, canonicalStatus } = resolvedData;

      this.logger.debug(
        `📊 Event ${eventKey} status: ${canonicalStatus} | Score: ${liveEvent.intHomeScore}-${liveEvent.intAwayScore}`,
      );

      // ========================================
      // 3️⃣ TRATAMENTO DE CANCELAMENTOS/ADIAMENTOS
      // ========================================
      if (
        canonicalStatus === MatchStatus.CANCELLED ||
        canonicalStatus === MatchStatus.POSTPONED
      ) {
        await Promise.all(
          bets.map((b) =>
            this.cancelledHandler.handleCancelledOrPostponed(
              b,
              canonicalStatus,
              tsdbEventId,
            ),
          ),
        );
        stats.returned += bets.length;
        stats.processed += bets.length;
        return stats;
      }

      // ========================================
      // 4️⃣ SINCRONIZA BANCO LOCAL (se tiver externalMatchId)
      // ========================================
      let homeScoreHT = 0;
      let awayScoreHT = 0;

      if (betRef.externalMatchId) {
        const syncResult = await this.externalMatch.syncExternalMatch(
          betRef,
          tsdbEventId,
          canonicalStatus,
          Number(liveEvent.intHomeScore ?? 0),
          Number(liveEvent.intAwayScore ?? 0),
        );

        homeScoreHT = syncResult.homeScoreHT ?? 0;
        awayScoreHT = syncResult.awayScoreHT ?? 0;
      }

      // ========================================
      // 5️⃣ PROCESSA CADA APOSTA COM ANALYZER
      // ========================================
      const results = await Promise.allSettled(
        bets.map((bet) =>
          this.singleBet.settleSingleBet(bet, {
            homeScore: Number(liveEvent.intHomeScore ?? 0),
            awayScore: Number(liveEvent.intAwayScore ?? 0),
            homeScoreHT,
            awayScoreHT,
            canonicalStatus,
          }),
        ),
      );

      return this.statsUpdate.updateStats(results, stats, bets);
    } catch (error) {
      this.logger.error(
        `Batch error for event ${eventKey}`,
        error instanceof Error ? error.stack : String(error),
      );
      stats.errors += bets.length;
      return stats;
    }
  }

  async processEventBatchByIds(
    eventKey: string,
    betIds: number[],
  ): Promise<SettlementStats> {
    const bets = await this.prisma.bets.findMany({
      where: { id: { in: betIds } },
      include: { externalMatch: true },
    });

    if (!bets.length) return createStats();

    return this.processEventBatch(
      eventKey,
      bets as unknown as BetWithExternalMatch[],
    );
  }
}
