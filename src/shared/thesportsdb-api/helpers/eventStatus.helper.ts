import { MatchStatus } from '@prisma/client';

export function parseEventStatus(status: MatchStatus) {
  return {
    isNotStarted: status === MatchStatus.NOT_STARTED,
    isFirstHalf: status === MatchStatus.FIRST_HALF,
    isHalfTime: status === MatchStatus.HALF_TIME,
    isSecondHalf: status === MatchStatus.SECOND_HALF,
    isFinished: status === MatchStatus.FINISHED,
    isLive:
      status === MatchStatus.FIRST_HALF ||
      status === MatchStatus.SECOND_HALF ||
      status === MatchStatus.HALF_TIME,
  };
}
