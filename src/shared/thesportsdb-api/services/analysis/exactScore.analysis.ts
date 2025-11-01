import { Result } from '@prisma/client';
import { EventMarketAnalysis } from './base.analysis';

export function analyzePlacarExato(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const [expectedHome, expectedAway] = eventDetails.split('-').map(Number);
  const won = homeScore === expectedHome && awayScore === expectedAway;

  return { result: won ? Result.win : Result.lose, shouldUpdate: true };
}
