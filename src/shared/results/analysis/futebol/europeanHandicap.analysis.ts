import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

export function analyzeHandicapEuropeuBinary(
  eventDetails: string,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  // 🔒 Não começou / sem score → não liquida
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

  // Handicap Europeu (binário) decide no FT
  if (status !== MatchStatus.FINISHED) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // Extrai handicap inteiro (ex: -2, -1, +1, +2)
  const match = normalized.match(/([+-]?\d+)/);
  if (!match) return voidResult();

  const handicap = parseInt(match[1], 10);
  if (Number.isNaN(handicap)) return voidResult();

  const adjustedHomeScore = homeScore + handicap;
  const adjustedAwayScore = awayScore;

  const won = adjustedHomeScore > adjustedAwayScore; // empate ajustado = lose

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
    isFinalizableEarly: false,
  };
}
