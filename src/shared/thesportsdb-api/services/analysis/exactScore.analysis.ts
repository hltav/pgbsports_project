/* eslint-disable @typescript-eslint/no-unused-vars */
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

export function analyzePlacarExatoImproved(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
  homeScoreHT?: number,
  awayScoreHT?: number,
): EventMarketAnalysis {
  console.log('🔍 DEBUG:', { eventDetails, homeScore, awayScore });

  const parts = eventDetails.split(/[-x]/);
  console.log('🔍 DEBUG parts:', parts);

  if (parts.length !== 2) {
    console.log('❌ Formato inválido - retornando void');
    return { result: Result.void, shouldUpdate: true };
  }

  const expectedHome = parseInt(parts[0].trim(), 10);
  const expectedAway = parseInt(parts[1].trim(), 10);

  console.log('🔍 DEBUG parsed:', { expectedHome, expectedAway });

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
      isFinalizableEarly: true,
    };
  }

  if (isAlreadyImpossible) {
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true,
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

  const expectedDifference = expectedHome - expectedAway;
  const currentDifference = currentHome - currentAway;

  if (Math.abs(currentDifference) > Math.abs(expectedDifference)) {
    return true;
  }

  return false;
}
