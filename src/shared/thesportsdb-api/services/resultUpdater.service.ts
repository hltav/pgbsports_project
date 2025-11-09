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
  analyzePlacarExato,
  analyzeDuplaChance,
} from './analysis';
import { TheSportsDbEventsService } from './events-thesportsdb.service';
import { LookupEvent } from '../schemas/allEvents/allEvents.schema';
import {
  analyzeAmbasMarcamPrimeiroTempo,
  analyzeGolsPrimeiroTempo,
  analyzeIntervaloFinal,
  analyzeVencedorPrimeiroTempo,
} from './analysis/finalInterval.analysis';
import { EventsService } from './../../../modules';

@Injectable()
export class ResultUpdaterService {
  private readonly logger = new Logger(ResultUpdaterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly theSportsDbLiveApi: TheSportsDbLiveApiService,
    private readonly eventsService: TheSportsDbEventsService,
    private readonly eventsUpdateService: EventsService,
  ) {
    console.log('✅ ResultUpdaterService instanciado');
  }

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

      if (
        eventStatus === EventStatus.POSTPONED ||
        eventStatus === EventStatus.CANCELLED
      ) {
        // await this.prisma.event.update({
        //   where: { id: eventId },
        //   data: { result: Result.returned },
        // });
        await this.eventsUpdateService.updateEvent(eventId, {
          userId: event.userId,
          result: Result.returned,
        });
        this.logger.log(`Event ${eventId} marked as returned (${eventStatus})`);
        return;
      }

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

      const analysis = this.analyzeEventResult({
        ...event,
        intHomeScore: homeScore.toString(),
        intAwayScore: awayScore.toString(),
        strStatus: eventStatus,
      } as EventLiveScoreDTO);

      this.logger.debug(
        `Analysis result: shouldUpdate=${analysis.shouldUpdate}, isFinalizableEarly=${analysis.isFinalizableEarly}, result=${analysis.result}`,
      );

      const inProgressStatuses = [
        EventStatus.IN_PROGRESS,
        EventStatus.FIRST_HALF,
        EventStatus.SECOND_HALF,
        EventStatus.HALF_TIME,
      ];

      // if (
      //   analysis.shouldUpdate &&
      //   (eventStatus === EventStatus.FINISHED ||
      //     (inProgressStatuses.includes(eventStatus) &&
      //       analysis.isFinalizableEarly))
      // ) {
      //   await this.prisma.event.update({
      //     where: { id: eventId },
      //     data: { result: analysis.result },
      //   });
      //   this.logger.log(
      //     `Event ${eventId} updated (${eventStatus}) → ${analysis.result}${
      //       analysis.isFinalizableEarly ? ' (early)' : ''
      //     }`,
      //   );
      // } else {
      //   this.logger.log(
      //     `Event ${eventId} ainda não pode ser atualizado (${eventStatus})`,
      //   );
      // }
      if (
        analysis.shouldUpdate &&
        (eventStatus === EventStatus.FINISHED ||
          (inProgressStatuses.includes(eventStatus) &&
            analysis.isFinalizableEarly))
      ) {
        // ✅ Use o método que já tem a lógica de bankroll
        await this.eventsUpdateService.updateEvent(eventId, {
          userId: event.userId,
          result: analysis.result,
        });

        this.logger.log(
          `Event ${eventId} updated (${eventStatus}) → ${analysis.result}${
            analysis.isFinalizableEarly ? ' (early)' : ''
          }`,
        );
      } else {
        this.logger.log(
          `Event ${eventId} ainda não pode ser atualizado (${eventStatus})`,
        );
      }
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

    if (market.includes('Gols 1º Tempo') || market.includes('1st Half Goals'))
      return analyzeGolsPrimeiroTempo(details, homeScoreHT, awayScoreHT);
    if (
      market.includes('Vencedor 1º Tempo') ||
      market.includes('1st Half Winner')
    )
      return analyzeVencedorPrimeiroTempo(details, homeScoreHT, awayScoreHT);
    if (
      market.includes('Ambas Marcam 1º Tempo') ||
      market.includes('BTTS 1st Half')
    )
      return analyzeAmbasMarcamPrimeiroTempo(details, homeScoreHT, awayScoreHT);
    if (market.includes('Intervalo/Final') || market.includes('HT/FT'))
      return analyzeIntervaloFinal(
        details,
        homeScoreHT,
        awayScoreHT,
        homeScore,
        awayScore,
      );

    if (market.includes('Resultado Final'))
      return analyzeResultadoFinal(details, homeScore, awayScore);
    if (
      market.includes('Total de Gols') ||
      market.includes('Gols (Over/Under)')
    )
      return analyzeTotalGols(details, homeScore, awayScore);
    if (market.includes('Ambas'))
      return analyzeAmbasMarcam(details, homeScore, awayScore);
    if (market.includes('Placar Exato'))
      return analyzePlacarExato(details, homeScore, awayScore);
    if (market.includes('Dupla Chance'))
      return analyzeDuplaChance(details, homeScore, awayScore);

    return { result: Result.void, shouldUpdate: true };
  }
}
