import { Injectable } from '@nestjs/common';
import { TheSportsDbCachedService } from './theSportsDbCached.service';
import {
  NextEventsResponse,
  NextEventsResponseSchema,
} from '../schemas/nextEvent/nextEvent.schema';
import {
  LookupEvent,
  LookupEventResponse,
  LookupEventResponseSchema,
} from '../schemas/allEvents/allEvents.schema';
@Injectable()
export class TheSportsDbEventsService {
  constructor(private readonly cacheService: TheSportsDbCachedService) {}

  async getNextEventsByLeague(
    leagueId: number,
  ): Promise<NextEventsResponse['schedule']> {
    const endpoint = `schedule/next/league/${leagueId}`;

    const data = await this.cacheService.getWithCache<NextEventsResponse>(
      endpoint,
      undefined,
      15 * 60 * 1000,
    );

    const parsed = NextEventsResponseSchema.parse(data);

    const upcomingEvents = parsed.schedule.filter(
      (event) => event.strStatus === 'Not Started',
    );

    return upcomingEvents;
  }

  async getEventById(eventId: string): Promise<LookupEvent | null> {
    const endpoint = `lookup/event/${eventId}`;

    const data = await this.cacheService.getWithCache<LookupEventResponse>(
      endpoint,
      undefined,
      5 * 60 * 1000,
    );

    const parsed = LookupEventResponseSchema.parse(data);
    return parsed.lookup?.[0] ?? null;
  }
}
