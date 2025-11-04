import { EventStatus } from '../enums/eventStatus.enum';

export function mapApiStatus(status?: string | null): EventStatus {
  const normalized = (status || '').toLowerCase();

  if (normalized.includes('not started')) return EventStatus.NOT_STARTED;
  if (normalized.includes('finished') || normalized.includes('match finished'))
    return EventStatus.FINISHED;
  if (normalized.includes('postponed')) return EventStatus.POSTPONED;
  if (normalized.includes('cancelled') || normalized.includes('abandoned'))
    return EventStatus.CANCELLED;
  if (normalized === '1h' || normalized.includes('first half'))
    return EventStatus.FIRST_HALF;
  if (normalized === '2h' || normalized.includes('second half'))
    return EventStatus.SECOND_HALF;
  if (normalized === 'ht' || normalized.includes('half time'))
    return EventStatus.HALF_TIME;

  return EventStatus.IN_PROGRESS;
}
