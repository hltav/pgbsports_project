import { Result } from '@prisma/client';
import { EventMarketAnalysis } from './base.analysis';

export function analyzeTotalGols(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();
  const totalGols = homeScore + awayScore;

  const isMais = normalized.includes('mais') || normalized.includes('over');
  const isMenos = normalized.includes('menos') || normalized.includes('under');

  const match = normalized.match(/\d+\.?\d*/);
  const threshold = match ? parseFloat(match[0]) : 0;

  let won = false;
  if (isMais && totalGols > threshold) won = true;
  if (isMenos && totalGols < threshold) won = true;

  let isFinalizableEarly = false;

  if (isMais) {
    isFinalizableEarly = won;
  } else if (isMenos) {
    isFinalizableEarly = totalGols >= threshold;
  }

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
    isFinalizableEarly,
  };
}
