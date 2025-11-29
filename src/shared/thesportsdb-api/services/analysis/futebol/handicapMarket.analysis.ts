import { Result } from '@prisma/client';
import { EventMarketAnalysis } from '../base.analysis';

export function analyzeHandicapPorTempo(
  eventDetails: string,
  homeScoreHT: number,
  awayScoreHT: number,
): EventMarketAnalysis {
  try {
    const normalized = eventDetails.toLowerCase();

    const isCasa = normalized.includes('casa');
    const isFora = normalized.includes('fora');

    if (!isCasa && !isFora) {
      return { result: Result.void, shouldUpdate: true };
    }

    // Regex extremamente robusta: captura SOMENTE handicap válido
    const match = normalized.match(
      /(?:casa|fora)\s+([+-]?\d+(?:\.\d+)?)(?!\s*º)/,
    );

    if (!match) {
      return { result: Result.void, shouldUpdate: true };
    }

    const handicap = parseFloat(match[1]);

    let won = false;

    if (isCasa) {
      const adjustedHome = homeScoreHT + handicap;
      const adjustedAway = awayScoreHT;
      won = adjustedHome > adjustedAway;
    } else {
      const adjustedHome = homeScoreHT;
      const adjustedAway = awayScoreHT + handicap;
      won = adjustedAway > adjustedHome;
    }

    return {
      result: won ? Result.win : Result.lose,
      shouldUpdate: true,
    };
  } catch {
    return { result: Result.void, shouldUpdate: true };
  }
}
