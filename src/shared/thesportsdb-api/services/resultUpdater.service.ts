import { Injectable, Logger } from '@nestjs/common';
import { Result } from '@prisma/client';
import { PrismaService } from '../../../libs/database/prisma';
import { TheSportsDbLiveApiService } from './theSportsDbLive.service';
import {
  parseLiveScores,
  LiveScoreEvent,
} from '../schemas/live/liveScore.schema';
import { EventLiveScoreDTO } from '../schemas/live/eventLiveScore.schema';
import { mapModalityToSport } from '../utils/sport.mapper';
import { mapApiStatus } from '../utils/status.mapper';
import { EventStatus } from '../enums/eventStatus.enum';
import { EventMarketAnalysis } from '../services/analysis/base.analysis';
import {
  analyzeResultadoFinal,
  analyzeTotalGols,
  analyzeAmbasMarcam,
  analyzeDuplaChance,
  analyzeAmbasMarcamEmAmbosTempos,
  analyzePlacarExatoImproved,
} from './analysis';
import { TheSportsDbEventsService } from './events-thesportsdb.service';
import { LookupEvent } from '../schemas/allEvents/allEvents.schema';
import {
  analyzeAmbasMarcamPrimeiroTempo,
  analyzeGolsPrimeiroTempo,
  analyzeIntervaloFinal,
  analyzeVencedor2oTempo,
  analyzeVencedorPrimeiroTempo,
} from './analysis/finalInterval.analysis';
import { EventsService } from './../../../modules';
import { analyzeEmpateAnulaAposta } from './analysis/drawNoBet.analysis';

@Injectable()
export class ResultUpdaterService {
  private readonly logger = new Logger(ResultUpdaterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly theSportsDbLiveApi: TheSportsDbLiveApiService,
    private readonly eventsService: TheSportsDbEventsService,
    private readonly eventsUpdateService: EventsService,
  ) {}

  async updateAllPendingEvents(): Promise<void> {
    const pendingEvents = await this.prisma.event.findMany({
      where: { result: 'pending' },
    });

    this.logger.log(`Found ${pendingEvents.length} pending events to update`);

    for (const event of pendingEvents) {
      await this.updateEventResult(event.id);
    }
  }

  async updateEventResult(eventId: number): Promise<void> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event || event.result !== 'pending') return;

    try {
      const sport = mapModalityToSport(event.modality);

      const liveEvent: LiveScoreEvent | LookupEvent | null =
        await this.fetchEventData(sport, event.apiEventId ?? '');

      if (!liveEvent) {
        this.logger.warn(`No data found for event ID ${eventId}`);
        return;
      }

      const eventStatus = mapApiStatus(
        'strStatus' in liveEvent ? liveEvent.strStatus : 'FT',
      );

      // 1) POSTPONED / CANCELLED → RETURNED
      if (
        eventStatus === EventStatus.POSTPONED ||
        eventStatus === EventStatus.CANCELLED
      ) {
        await this.eventsUpdateService.updateEvent(eventId, {
          userId: event.userId,
          result: Result.returned,
        });
        this.logger.log(`Event ${eventId} marked as returned (${eventStatus})`);
        return;
      }

      // 2) Placar atual
      const homeScore =
        'intHomeScore' in liveEvent
          ? parseInt(liveEvent.intHomeScore ?? '0', 10)
          : (liveEvent.intHomeScore ?? 0);

      const awayScore =
        'intAwayScore' in liveEvent
          ? parseInt(liveEvent.intAwayScore ?? '0', 10)
          : (liveEvent.intAwayScore ?? 0);

      if (homeScore == null || awayScore == null) {
        this.logger.warn(`Event ${eventId} sem placar definido ainda`);
        return;
      }

      // 3) SALVAR HT AUTOMATICAMENTE (APENAS NO MOMENTO DO INTERVALO)
      if (
        eventStatus === EventStatus.HALF_TIME &&
        (event.homeScoreHT === null ||
          event.awayScoreHT === null ||
          (event.homeScoreHT === 0 && event.awayScoreHT === 0))
      ) {
        await this.eventsUpdateService.updateEvent(eventId, {
          userId: event.userId,
          homeScoreHT: Number(homeScore),
          awayScoreHT: Number(awayScore),
        });

        this.logger.log(
          `HT score saved for event ${eventId}: ${homeScore}–${awayScore}`,
        );
      }

      // 4) Preparar dados para análise
      const homeScoreHT = event.homeScoreHT ?? homeScore;
      const awayScoreHT = event.awayScoreHT ?? awayScore;

      const analysis = this.analyzeEventResult({
        ...event,
        intHomeScore: homeScore.toString(),
        intAwayScore: awayScore.toString(),
        strStatus: eventStatus,
        homeScoreHT,
        awayScoreHT,
        homeScoreFT: homeScore,
        awayScoreFT: awayScore,
      } as EventLiveScoreDTO);

      this.logger.debug(
        `Analysis result: shouldUpdate=${analysis.shouldUpdate}, isFinalizableEarly=${analysis.isFinalizableEarly}, result=${analysis.result}`,
      );

      // 5) Condições para finalização
      const inProgressStatuses = [
        EventStatus.IN_PROGRESS,
        EventStatus.FIRST_HALF,
        EventStatus.SECOND_HALF,
        EventStatus.HALF_TIME,
      ];

      const isFirstHalfMarket =
        event.market.includes('1º Tempo') ||
        event.market.includes('1st Half') ||
        event.market.includes('Intervalo/Final') ||
        event.market.includes('HT/FT');

      const shouldFinalizeAtHalfTime =
        isFirstHalfMarket && eventStatus === EventStatus.HALF_TIME;

      const shouldFinalizeAtFinish =
        !isFirstHalfMarket && eventStatus === EventStatus.FINISHED;

      const canFinalizeEarly =
        inProgressStatuses.includes(eventStatus) && analysis.isFinalizableEarly;

      // 6) FINALIZAÇÃO
      if (
        analysis.shouldUpdate &&
        (shouldFinalizeAtHalfTime || shouldFinalizeAtFinish || canFinalizeEarly)
      ) {
        await this.eventsUpdateService.updateEvent(eventId, {
          userId: event.userId,
          result: analysis.result,
        });

        this.logger.log(
          `Event ${eventId} updated (${eventStatus}) → ${analysis.result}${
            analysis.isFinalizableEarly ? ' (early)' : ''
          }`,
        );
        return;
      }

      // 7) Se chegou aqui, ainda não está pronto para finalizar
      this.logger.log(
        `Event ${eventId} ainda não pode ser atualizado (${eventStatus})`,
      );
    } catch (error) {
      this.logger.error(`Error updating event ${eventId}`, error);
    }
  }

  private async fetchEventData(
    sport: string,
    apiEventId: string,
  ): Promise<LiveScoreEvent | LookupEvent | null> {
    const liveScoresRaw = await this.theSportsDbLiveApi.getLiveScores(sport);
    const liveScores: LiveScoreEvent[] = parseLiveScores(liveScoresRaw);

    const event = liveScores.find((l) => l.idEvent === apiEventId);
    if (event) return event;

    this.logger.warn(
      `Live event not found for event ID ${apiEventId}, trying lookup...`,
    );

    const pastEvent = await this.eventsService.getEventById(apiEventId);
    return pastEvent ?? null;
  }

  private analyzeEventResult(
    eventData: EventLiveScoreDTO,
  ): EventMarketAnalysis {
    const homeScore = parseInt(eventData.intHomeScore || '0', 10);
    const awayScore = parseInt(eventData.intAwayScore || '0', 10);
    const market = eventData.market;
    const details = eventData.optionMarket;

    const homeScoreHT = eventData.homeScoreHT ?? 0;
    const awayScoreHT = eventData.awayScoreHT ?? 0;

    this.logger.debug(
      `Analyzing event: market="${market}", details="${details}", homeScore=${homeScore}, awayScore=${awayScore}, homeScoreHT=${homeScoreHT}, awayScoreHT=${awayScoreHT}`,
    );

    // --------------------- 1º TEMPO ---------------------

    if (market.includes('Gols 1º Tempo') || market.includes('1st Half Goals'))
      return analyzeGolsPrimeiroTempo(details, homeScoreHT, awayScoreHT);

    if (
      market.includes('Vencedor 1º Tempo') ||
      market.includes('1st Half Winner') ||
      market.includes('Resultado do 1º Tempo')
    )
      return analyzeVencedorPrimeiroTempo(details, homeScoreHT, awayScoreHT);

    if (
      market.includes('Ambas Marcam 1º Tempo') ||
      market.includes('BTTS 1st Half')
    )
      return analyzeAmbasMarcamPrimeiroTempo(details, homeScoreHT, awayScoreHT);

    // Ambas marcam em ambos os tempos
    if (
      market.includes('Ambas Marcam Ambos Tempos') ||
      market.includes('BTTS Both Halves')
    )
      return analyzeAmbasMarcamEmAmbosTempos(
        details,
        homeScoreHT,
        awayScoreHT,
        homeScore,
        awayScore,
      );

    // Intervalo/Final
    if (market.includes('Intervalo/Final') || market.includes('HT/FT'))
      return analyzeIntervaloFinal(
        details,
        homeScoreHT,
        awayScoreHT,
        homeScore,
        awayScore,
      );

    // Vencedor do 2º Tempo
    if (
      market.includes('Vencedor 2º Tempo') ||
      market.includes('2nd Half Winner')
    )
      return analyzeVencedor2oTempo(
        details,
        homeScoreHT,
        awayScoreHT,
        homeScore,
        awayScore,
      );

    // --------------------- TEMPO FINAL ---------------------

    if (market.includes('Resultado Final'))
      return analyzeResultadoFinal(details, homeScore, awayScore);

    if (
      market.includes('Total de Gols') ||
      market.includes('Gols (Over/Under)')
    )
      return analyzeTotalGols(details, homeScore, awayScore);

    // Ambas marcam (full-time)
    if (market.includes('Ambas'))
      return analyzeAmbasMarcam(details, homeScore, awayScore);

    // Placar Exato
    if (market.includes('Placar Exato')) {
      return analyzePlacarExatoImproved(
        details,
        homeScore,
        awayScore,
        homeScoreHT,
        awayScoreHT,
      );
    }

    // Dupla Chance
    if (market.includes('Dupla Chance'))
      return analyzeDuplaChance(details, homeScore, awayScore);

    // Empate Anula Aposta (DNB)
    if (
      market.includes('Empate Anula') ||
      market.includes('Draw No Bet') ||
      market.includes('DNB')
    )
      return analyzeEmpateAnulaAposta(details, homeScore, awayScore);

    return { result: Result.void, shouldUpdate: true };
  }
}
