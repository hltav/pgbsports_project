import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

export function analyzeNumeroParImpar(
  eventDetails: string,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  const isEven =
    normalized.includes('par') &&
    !normalized.includes('ímpar') &&
    !normalized.includes('impar');
  const isOdd = normalized.includes('ímpar') || normalized.includes('impar');

  if (!isEven && !isOdd) return voidResult();

  // 🔒 NOT_STARTED / sem score → não liquida
  if (
    status === MatchStatus.NOT_STARTED ||
    homeScore == null ||
    awayScore == null
  ) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // Par/Ímpar decide no FT
  if (status !== MatchStatus.FINISHED) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  const totalGols = homeScore + awayScore;

  const won = isEven ? totalGols % 2 === 0 : totalGols % 2 !== 0;

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
    isFinalizableEarly: false,
  };
}
