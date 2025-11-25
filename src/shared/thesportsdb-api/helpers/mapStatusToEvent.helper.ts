import { EventStatus } from '../enums/eventStatus.enum';

export function mapStrStatusToEventStatus(strStatus: string): EventStatus {
  const s = strStatus.trim().toLowerCase();

  if (s.includes('not started') || s.includes('ns') || s === '' || s === '0') {
    return EventStatus.NOT_STARTED;
  }

  if (s.includes('1st') || s.includes('first')) {
    return EventStatus.FIRST_HALF;
  }

  if (s === 'ht' || s.includes('half time')) {
    return EventStatus.HALF_TIME;
  }

  if (s.includes('2nd') || s.includes('second')) {
    return EventStatus.SECOND_HALF;
  }

  if (
    s === 'ft' ||
    s.includes('full time') ||
    s.includes('finished') ||
    s.includes('end')
  ) {
    return EventStatus.FINISHED;
  }

  if (s.includes('postponed') || s.includes('pp')) {
    return EventStatus.POSTPONED;
  }

  if (s.includes('cancel') || s.includes('abandoned')) {
    return EventStatus.CANCELLED;
  }

  // fallback: jogo em andamento se nada mais casar
  return EventStatus.IN_PROGRESS;
}
