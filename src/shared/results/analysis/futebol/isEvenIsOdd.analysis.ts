import { Result } from '@prisma/client';
import { EventMarketAnalysis } from '../base.analysis';

export function analyzeNumeroParImpar(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();
  const totalGols = homeScore + awayScore;

  const isEven = normalized.includes('par') && !normalized.includes('ímpar');
  const isOdd = normalized.includes('ímpar');

  let won = false;

  if (isEven) {
    // 0, 2, 4, 6... são pares
    won = totalGols % 2 === 0;
  } else if (isOdd) {
    // 1, 3, 5, 7... são ímpares
    won = totalGols % 2 !== 0;
  } else {
    return { result: Result.void, shouldUpdate: true };
  }

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
  };
}
