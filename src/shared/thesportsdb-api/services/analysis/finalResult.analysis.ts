import { Result } from '@prisma/client';
import { EventMarketAnalysis } from './base.analysis';

export function analyzeResultadoFinal(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  let won = false;

  if (eventDetails.includes('Casa') && homeScore > awayScore) won = true;
  if (eventDetails.includes('Empate') && homeScore === awayScore) won = true;
  if (eventDetails.includes('Fora') && awayScore > homeScore) won = true;

  return { result: won ? Result.win : Result.lose, shouldUpdate: true };
}
