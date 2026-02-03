import { Result } from '@prisma/client';
import { EventMarketAnalysis } from '../base.analysis';

export function analyzeTotalExatoGols(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();
  const totalGols = homeScore + awayScore;

  let expectedGols: number | null = null;
  let is6Plus = false;

  // Extrair número exato ou "6+" para 6 ou mais
  if (normalized.includes('6+')) {
    is6Plus = true;
    expectedGols = 6;
  } else {
    const match = normalized.match(/\d+/);
    if (match) {
      expectedGols = parseInt(match[0], 10);
    }
  }

  if (expectedGols === null) {
    return { result: Result.void, shouldUpdate: true };
  }

  let won = false;
  let isFinalizableEarly = false;

  if (is6Plus) {
    won = totalGols >= 6;
    isFinalizableEarly = totalGols >= 6; // Ganhou ou impossível virar perdedor
  } else {
    won = totalGols === expectedGols;
    // Finalizável quando: acertou (win) OU passou do esperado (lose definitivo)
    isFinalizableEarly = totalGols >= expectedGols;
  }

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
    isFinalizableEarly,
  };
}
