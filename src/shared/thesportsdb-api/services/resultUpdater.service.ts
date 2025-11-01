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

@Injectable()
export class ResultUpdaterService {
  private readonly logger = new Logger(ResultUpdaterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly theSportsDbLiveApi: TheSportsDbLiveApiService,
    private readonly eventsService: TheSportsDbEventsService,
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

      if (
        eventStatus === EventStatus.POSTPONED ||
        eventStatus === EventStatus.CANCELLED
      ) {
        await this.prisma.event.update({
          where: { id: eventId },
          data: { result: Result.returned },
        });
        this.logger.log(`Event ${eventId} marked as returned (${eventStatus})`);
        return;
      }

      if (eventStatus !== EventStatus.FINISHED) {
        this.logger.log(`Event ${eventId} ainda não terminou (${eventStatus})`);
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

      if (analysis.shouldUpdate) {
        await this.prisma.event.update({
          where: { id: eventId },
          data: { result: analysis.result },
        });
        this.logger.log(`Event ${eventId} updated to ${analysis.result}`);
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

    this.logger.debug(
      `Analyzing event: market="${market}", details="${details}", homeScore=${homeScore}, awayScore=${awayScore}`,
    );

    if (market.includes('Resultado Final'))
      return analyzeResultadoFinal(details, homeScore, awayScore);
    if (market.includes('Total de Gols'))
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
