import { Injectable, Logger } from '@nestjs/common';
import { TheSportsDbCachedService } from './theSportsDbCached.service';
import {
  LookupEvent,
  LookupEventResponse,
  LookupEventResponseSchema,
} from '../schemas/allEvents/allEvents.schema';
import {
  NextEventsResponse,
  NextEventsResponseSchema,
} from '../schemas/nextEvent/nextEvent.schema';
import { CACHE_TTL } from './../../../libs/utils/cache.constants';
import { MatchStatus } from '@prisma/client';

@Injectable()
export class TheSportsDbEventsService {
  private readonly logger = new Logger(TheSportsDbEventsService.name);

  constructor(private readonly cacheService: TheSportsDbCachedService) {}

  async getNextEventsByLeague(
    leagueId: number,
  ): Promise<NextEventsResponse['schedule']> {
    const endpoint = `schedule/next/league/${leagueId}`;

    const data = await this.cacheService.getWithCache<NextEventsResponse>(
      endpoint,
      undefined,
      CACHE_TTL.ONE_MONTH,
    );

    const parsed = NextEventsResponseSchema.parse(data);

    return parsed.schedule.filter(
      (event) => event.strStatus === MatchStatus.NOT_STARTED,
    );
  }

  public async searchEventsByDateCached(
    dates: string[],
    leagueId: string,
    season: string,
  ): Promise<Map<string, LookupEvent[]>> {
    const result = new Map<string, LookupEvent[]>();

    // Criamos um array de tarefas (Promises) sem usar o 'await' dentro do map
    const tasks = dates.map(async (date) => {
      const isoDate =
        typeof date === 'string'
          ? date
          : new Date(date).toISOString().split('T')[0];
      const events = await this.searchEventsByDate(isoDate, leagueId, season);
      return { isoDate, events };
    });

    // Executa todas as chamadas ao mesmo tempo
    const reports = await Promise.all(tasks);

    // Alimenta o mapa de resultados
    reports.forEach((report) => result.set(report.isoDate, report.events));

    return result;
  }

  public async searchEventsByDate(
    date: string | Date,
    leagueId?: string,
    season?: string,
  ): Promise<LookupEvent[]> {
    try {
      const isoDate =
        typeof date === 'string'
          ? date
          : new Date(date).toISOString().split('T')[0];
      const endpoint = `schedule/league/${leagueId}/${season}`;

      // O cacheService já lida com o Redis
      const data = await this.cacheService.getWithCache<LookupEventResponse>(
        endpoint,
        { date: isoDate },
        CACHE_TTL.ONE_DAY,
      );

      const parsed = LookupEventResponseSchema.parse(data);
      return (parsed.schedule ?? []).filter((e) => e.dateEvent === isoDate);
    } catch (err) {
      this.logger.warn(`searchEventsByDate failed for ${String(date)}: ${err}`);
      return [];
    }
  }

  // Simplificamos o getEventById também
  async getEventById(eventId: string): Promise<LookupEvent | null> {
    const endpoint = `lookup/event/${eventId}`;
    const data = await this.cacheService.getWithCache<LookupEventResponse>(
      endpoint,
      undefined,
      CACHE_TTL.ONE_DAY,
    );
    return data.lookup?.[0] ?? null;
  }
}
