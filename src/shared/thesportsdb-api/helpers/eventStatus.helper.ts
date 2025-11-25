import { EventStatus } from '../enums/eventStatus.enum';

export function parseEventStatus(status: EventStatus) {
  return {
    isNotStarted: status === EventStatus.NOT_STARTED,
    isFirstHalf: status === EventStatus.FIRST_HALF,
    isHalfTime: status === EventStatus.HALF_TIME,
    isSecondHalf: status === EventStatus.SECOND_HALF,
    isFinished: status === EventStatus.FINISHED,
    isLive:
      status === EventStatus.FIRST_HALF ||
      status === EventStatus.SECOND_HALF ||
      status === EventStatus.HALF_TIME,
  };
}
