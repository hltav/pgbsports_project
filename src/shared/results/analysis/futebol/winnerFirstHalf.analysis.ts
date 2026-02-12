import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

export function analyzeVencedorPrimeiroTempo(
  details: string,
  homeScoreHT: number | null,
  awayScoreHT: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const d = details.toLowerCase().trim();

  const isHome = d.includes('casa') || d.includes('home') || d === '1';
  const isDraw = d.includes('empate') || d.includes('draw') || d === 'x';
  const isAway = d.includes('fora') || d.includes('away') || d === '2';

  if (!isHome && !isDraw && !isAway) return voidResult();

  // 🔒 NOT_STARTED / sem HT
  if (
    status === MatchStatus.NOT_STARTED ||
    homeScoreHT == null ||
    awayScoreHT == null
  ) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  const htEnded =
    status === MatchStatus.HALF_TIME || status === MatchStatus.FINISHED;

  // Enquanto não acabou o 1º tempo, não decide
  if (!htEnded) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  let won = false;
  if (isHome) won = homeScoreHT > awayScoreHT;
  if (isDraw) won = homeScoreHT === awayScoreHT;
  if (isAway) won = awayScoreHT > homeScoreHT;

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
    isFinalizableEarly: false,
  };
}
