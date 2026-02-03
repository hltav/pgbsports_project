import { Result } from '@prisma/client';
import { EventMarketAnalysis } from '../base.analysis';

export function analyzePlacarExatoImproved(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
  homeScoreHT?: number,
  awayScoreHT?: number,
  isMatchFinished = false,
): EventMarketAnalysis {
  const parts = eventDetails.split(/[-x]/);

  if (parts.length !== 2) {
    return { result: Result.void, shouldUpdate: true };
  }

  const expectedHome = parseInt(parts[0].trim(), 10);
  const expectedAway = parseInt(parts[1].trim(), 10);

  if (isNaN(expectedHome) || isNaN(expectedAway)) {
    return { result: Result.void, shouldUpdate: true };
  }

  const isAlreadyImpossible = isScoreImpossible(
    homeScore,
    awayScore,
    expectedHome,
    expectedAway,
  );

  const won = homeScore === expectedHome && awayScore === expectedAway;

  if (won) {
    return {
      result: Result.win,
      shouldUpdate: true,
      isFinalizableEarly: !isMatchFinished,
    };
  }

  if (isAlreadyImpossible) {
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: !isMatchFinished,
    };
  }

  return {
    result: Result.lose,
    shouldUpdate: true,
    isFinalizableEarly: false,
  };
}

export function isScoreImpossible(
  currentHome: number,
  currentAway: number,
  expectedHome: number,
  expectedAway: number,
): boolean {
  if (currentHome > expectedHome || currentAway > expectedAway) {
    return true;
  }

  return false;
}
