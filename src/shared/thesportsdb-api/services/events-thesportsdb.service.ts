import { Injectable } from '@nestjs/common';
import { TheSportsDbCachedService } from './theSportsDbCached.service';
import {
  NextEventsResponse,
  NextEventsResponseSchema,
} from '../schemas/nextEvent/nextEvent.schema';
@Injectable()
export class TheSportsDbEventsService {
  constructor(private readonly cacheService: TheSportsDbCachedService) {}

  async getNextEventsByLeague(
    leagueId: number,
  ): Promise<NextEventsResponse['schedule']> {
    const endpoint = `schedule/next/league/${leagueId}`;

    // TTL curto (15 minutos)
    const data = await this.cacheService.getWithCache<NextEventsResponse>(
      endpoint,
      undefined,
      15 * 60 * 1000,
    );

    const parsed = NextEventsResponseSchema.parse(data);

    // Retorna apenas eventos que ainda não começaram
    const upcomingEvents = parsed.schedule.filter(
      (event) => event.strStatus === 'Not Started',
    );

    return upcomingEvents;
  }
}
