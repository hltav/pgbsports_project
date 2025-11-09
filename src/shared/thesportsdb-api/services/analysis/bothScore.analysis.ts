import { Result } from '@prisma/client';
import { EventMarketAnalysis } from './base.analysis';

export function analyzeAmbasMarcam(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();
  const ambas = homeScore > 0 && awayScore > 0;
  const total = homeScore + awayScore;

  // Ambos marcam - Sim
  if (normalized.includes('ambos marcam - sim'))
    return {
      result: ambas ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true,
    };

  // Ambos marcam - Não
  if (
    normalized.includes('ambos marcam - não') ||
    normalized.includes('ambos marcam - nao')
  )
    return {
      result: !ambas ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true,
    };

  // Ambos marcam e +2.5 gols
  if (normalized.includes('ambos marcam e +') && normalized.includes('2.5'))
    return {
      result: ambas && total > 2.5 ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true,
    };

  // Ambos marcam ou +2.5 gols
  // if (normalized.includes('ambos marcam ou +') && normalized.includes('2.5'))
  //   return {
  //     result: ambas || total > 2.5 ? Result.win : Result.lose,
  //     shouldUpdate: true,
  //     isFinalizableEarly: true,
  //   };
  if (normalized.includes('ambos marcam ou +') && normalized.includes('2.5')) {
    if (ambas || total > 2.5) {
      return {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  return { result: Result.void, shouldUpdate: true, isFinalizableEarly: false };
}
