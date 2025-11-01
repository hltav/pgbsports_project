import { Result } from '@prisma/client';
import { EventMarketAnalysis } from './base.analysis';

export function analyzeAmbasMarcam(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const ambas = homeScore > 0 && awayScore > 0;
  const total = homeScore + awayScore;

  if (eventDetails.includes('Ambos marcam - Sim'))
    return { result: ambas ? Result.win : Result.lose, shouldUpdate: true };

  if (eventDetails.includes('Ambos marcam - Não'))
    return { result: !ambas ? Result.win : Result.lose, shouldUpdate: true };

  if (eventDetails.includes('Ambos marcam e + 2.5 gols'))
    return {
      result: ambas && total > 2.5 ? Result.win : Result.lose,
      shouldUpdate: true,
    };

  if (eventDetails.includes('Ambos marcam ou + 2.5 gols'))
    return {
      result: ambas || total > 2.5 ? Result.win : Result.lose,
      shouldUpdate: true,
    };

  return { result: Result.void, shouldUpdate: true };
}
