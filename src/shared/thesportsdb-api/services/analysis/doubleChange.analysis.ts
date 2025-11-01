import { Result } from '@prisma/client';
import { EventMarketAnalysis } from './base.analysis';

export function analyzeDuplaChance(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  let won = false;

  if (eventDetails.includes('Casa ou Empate')) won = homeScore >= awayScore;
  else if (eventDetails.includes('Fora ou Empate'))
    won = awayScore >= homeScore;
  else if (eventDetails.includes('Casa ou Fora')) won = homeScore !== awayScore;

  return { result: won ? Result.win : Result.lose, shouldUpdate: true };
}
