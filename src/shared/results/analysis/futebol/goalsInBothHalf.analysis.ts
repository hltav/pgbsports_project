import { Result } from '@prisma/client';
import { EventMarketAnalysis } from '../base.analysis';

export function analyzeGolNosDoisTempos(
  eventDetails: string,
  homeScoreHT: number,
  awayScoreHT: number,
  homeScoreFT: number,
  awayScoreFT: number,
): EventMarketAnalysis {
  const homeScore2ndHalf = homeScoreFT - homeScoreHT;
  const awayScore2ndHalf = awayScoreFT - awayScoreHT;

  const golsHT = homeScoreHT + awayScoreHT > 0;
  const gols2ndHalf = homeScore2ndHalf + awayScore2ndHalf > 0;

  const houveSim = golsHT && gols2ndHalf;

  if (eventDetails.toLowerCase().includes('sim')) {
    return {
      result: houveSim ? Result.win : Result.lose,
      shouldUpdate: true,
    };
  }

  if (
    eventDetails.toLowerCase().includes('não') ||
    eventDetails.toLowerCase().includes('nao')
  ) {
    return {
      result: !houveSim ? Result.win : Result.lose,
      shouldUpdate: true,
    };
  }

  return { result: Result.void, shouldUpdate: true };
}
