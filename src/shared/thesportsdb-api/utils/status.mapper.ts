import { EventStatus } from '../enums/eventStatus.enum';

export function mapApiStatus(status?: string | null): EventStatus {
  const normalized = (status || '').toLowerCase();

  if (normalized.includes('not started')) return EventStatus.NOT_STARTED;
  if (normalized.includes('finished') || normalized.includes('match finished'))
    return EventStatus.FINISHED;
  if (normalized.includes('postponed')) return EventStatus.POSTPONED;
  if (normalized.includes('cancelled') || normalized.includes('abandoned'))
    return EventStatus.CANCELLED;

  return EventStatus.IN_PROGRESS;
}
