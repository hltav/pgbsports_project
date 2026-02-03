import { Result } from '@prisma/client';
import { EventMarketAnalysis } from '../base.analysis';

/**
 * Resolve um handicap simples (0, ±0.5, ±1, etc)
 */
function resolveSimpleHandicap(
  handicap: number,
  homeScore: number,
  awayScore: number,
): Result {
  const diff = homeScore + handicap - awayScore;

  if (diff > 0) return Result.win;
  if (diff === 0) return Result.returned;
  return Result.lose;
}

/**
 * Divide handicaps asiáticos compostos (.25 / .75)
 */
function splitAsianHandicap(handicap: number): number[] {
  const abs = Math.abs(handicap);
  const sign = Math.sign(handicap) || 1;
  const integer = Math.floor(abs);
  const decimal = abs - integer;

  // 0 ou 0.5 → handicap simples
  if (decimal === 0 || decimal === 0.5) {
    return [handicap];
  }

  // 0.25 → x.0 e x.5
  if (decimal === 0.25) {
    return [sign * integer, sign * (integer + 0.5)];
  }

  // 0.75 → x.5 e x+1
  if (decimal === 0.75) {
    return [sign * (integer + 0.5), sign * (integer + 1)];
  }

  // Fallback (não deveria acontecer)
  return [handicap];
}

export function analyzeHandicapAsiatico(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  // Extrai o handicap do texto
  const match = normalized.match(/([+-]?\d+(\.\d+)?)/);
  if (!match) {
    return { result: Result.void, shouldUpdate: true };
  }

  const handicap = parseFloat(match[1]);

  // Divide o handicap (se necessário)
  const handicaps = splitAsianHandicap(handicap);

  // Resolve cada parte
  const results = handicaps.map((h) =>
    resolveSimpleHandicap(h, homeScore, awayScore),
  );

  // Handicap simples
  if (results.length === 1) {
    return { result: results[0], shouldUpdate: true };
  }

  // Handicap composto (.25 / .75)
  const [r1, r2] = results;

  if (r1 === Result.win && r2 === Result.win)
    return { result: Result.win, shouldUpdate: true };

  if (r1 === Result.lose && r2 === Result.lose)
    return { result: Result.lose, shouldUpdate: true };

  if (
    (r1 === Result.win && r2 === Result.returned) ||
    (r2 === Result.win && r1 === Result.returned)
  )
    return { result: Result.half_win, shouldUpdate: true };

  if (
    (r1 === Result.lose && r2 === Result.returned) ||
    (r2 === Result.lose && r1 === Result.returned)
  )
    return { result: Result.half_lose, shouldUpdate: true };

  // returned + returned
  return { result: Result.returned, shouldUpdate: true };
}
