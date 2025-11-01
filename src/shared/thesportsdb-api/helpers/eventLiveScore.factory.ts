import { EventLiveScoreDTO } from '../schemas/live/eventLiveScore.schema';
import { Event } from '@prisma/client';

export function createEventLiveScoreDTO(
  event: Event,
  intHomeScore: number,
  intAwayScore: number,
  strStatus: string,
): EventLiveScoreDTO {
  return {
    ...event,
    apiEventId: event.apiEventId ?? null,
    homeTeam: event.homeTeam ?? null,
    awayTeam: event.awayTeam ?? null,
    eventDate: event.eventDate ?? null,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    intHomeScore: intHomeScore.toString(),
    intAwayScore: intAwayScore.toString(),
    strStatus,
    result: event.result as
      | 'pending'
      | 'win'
      | 'lose'
      | 'draw'
      | 'returned'
      | 'void',
  };
}
