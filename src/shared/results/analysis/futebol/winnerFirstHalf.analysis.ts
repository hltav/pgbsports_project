import { Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

export function analyzeVencedorPrimeiroTempo(
  details: string,
  homeScoreHT: number,
  awayScoreHT: number,
): EventMarketAnalysis {
  const detailsLower = details.toLowerCase();

  if (
    detailsLower.includes('casa') ||
    detailsLower.includes('home') ||
    detailsLower.includes('1')
  ) {
    return {
      result: homeScoreHT > awayScoreHT ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  if (
    detailsLower.includes('empate') ||
    detailsLower.includes('draw') ||
    detailsLower.includes('x')
  ) {
    return {
      result: homeScoreHT === awayScoreHT ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  if (
    detailsLower.includes('fora') ||
    detailsLower.includes('away') ||
    detailsLower.includes('2')
  ) {
    return {
      result: awayScoreHT > homeScoreHT ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  return voidResult();
}
