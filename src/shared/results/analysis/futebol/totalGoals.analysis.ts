import { Result } from '@prisma/client';
import { EventMarketAnalysis } from '../base.analysis';

export function analyzeTotalGols(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();
  const totalGols = homeScore + awayScore;

  const isOver = normalized.includes('mais') || normalized.includes('over');
  const isUnder = normalized.includes('menos') || normalized.includes('under');

  const match = normalized.match(/\d+\.?\d*/);
  const threshold = match ? parseFloat(match[0]) : 0;

  let won = false;
  if (isOver && totalGols > threshold) won = true;
  if (isUnder && totalGols < threshold) won = true;

  let isFinalizableEarly = false;

  if (isOver) {
    isFinalizableEarly = won;
  } else if (isUnder) {
    isFinalizableEarly = totalGols >= threshold;
  }

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
    isFinalizableEarly,
  };
}
