import { Result } from '@prisma/client';
import { EventMarketAnalysis } from '../base.analysis';

export function analyzeHandicapAsiatico(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  // Extrair handicap: -2.0, -1.75, -1.5, -1.25, -1, -0.75, -0.5, -0.25, 0, +0.25, etc
  const match = normalized.match(/([+-]?\d+\.?\d*)/);
  if (!match) {
    return { result: Result.void, shouldUpdate: true };
  }

  const handicap = parseFloat(match[1]);

  // No handicap asiático, o handicap é aplicado apenas ao time casa
  const adjustedHomeScore = homeScore + handicap;
  const adjustedAwayScore = awayScore;

  let result: Result = Result.lose;

  if (adjustedHomeScore > adjustedAwayScore) {
    result = Result.win;
  } else if (Math.abs(adjustedHomeScore - adjustedAwayScore) < 0.0001) {
    // Empate (com tolerância para erros de ponto flutuante)
    const decimalPart = Math.abs(handicap % 1);

    if (decimalPart < 0.0001 || Math.abs(decimalPart - 1) < 0.0001) {
      // Valores inteiros: -2, -1, 0, +1, +2
      result = Result.lose;
    } else if (Math.abs(decimalPart - 0.5) < 0.0001) {
      // Valores .5: -1.5, -0.5, +0.5, +1.5 - empate = lose
      result = Result.lose;
    } else {
      // Valores .25 ou .75: pode devolver metade
      result = Result.void;
    }
  } else {
    result = Result.lose;
  }

  return {
    result,
    shouldUpdate: true,
  };
}
