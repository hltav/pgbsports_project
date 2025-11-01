import { Result } from '@prisma/client';
import { EventMarketAnalysis } from './base.analysis';

export function analyzeTotalGols(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const totalGols = homeScore + awayScore;
  const isMais = eventDetails.includes('Mais');
  const threshold = parseFloat(eventDetails.match(/\d+\.?\d*/)?.[0] || '0');

  let won = false;
  if (isMais && totalGols > threshold) won = true;
  if (!isMais && totalGols < threshold) won = true;

  return { result: won ? Result.win : Result.lose, shouldUpdate: true };
}
