import { Result } from '@prisma/client';
import { EventMarketAnalysis } from './base.analysis';

export function analyzeEmpateAnulaAposta(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  if (homeScore === awayScore) {
    return { result: Result.returned, shouldUpdate: true };
  }

  if (eventDetails.includes('Casa')) {
    return {
      result: homeScore > awayScore ? Result.win : Result.lose,
      shouldUpdate: true,
    };
  }

  if (eventDetails.includes('Fora')) {
    return {
      result: awayScore > homeScore ? Result.win : Result.lose,
      shouldUpdate: true,
    };
  }

  return { result: Result.void, shouldUpdate: true };
}
