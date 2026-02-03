import { Result } from '@prisma/client';
import { EventMarketAnalysis } from '../base.analysis';

export function analyzeHandicapEuropeuBinary(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  // Handicap Europeu (modelo binário):
  // A aposta só é vencedora se, após aplicar o handicap ao time da casa,
  // o placar ajustado da casa for MAIOR que o do visitante.
  // Empate ajustado = aposta perdedora.
  // Opções: -2, -1, +1, +2
  let handicap: number | null = null;

  const match = normalized.match(/([+-]?\d+)/);
  if (match) {
    handicap = parseInt(match[1], 10);
  }

  if (handicap === null) {
    return { result: Result.void, shouldUpdate: true };
  }

  // Nota: o handicap é do time CASA
  // Casa -1 significa: subtrair 1 do score da casa
  // Casa +1 significa: adicionar 1 ao score da casa

  const adjustedHomeScore = homeScore + handicap;
  const adjustedAwayScore = awayScore;

  let won = false;

  if (adjustedHomeScore > adjustedAwayScore) {
    won = true;
  } else {
    won = false;
  }

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
  };
}
