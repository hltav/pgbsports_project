import { Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

// 📊 Intervalo/Final (HT/FT)
export function analyzeIntervaloFinal(
  details: string,
  homeScoreHT: number,
  awayScoreHT: number,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const parts = details.split('/');

  if (parts.length !== 2) {
    return voidResult();
  }

  const [htResult, ftResult] = parts.map((s) => s.trim().toLowerCase());

  // Resultado do intervalo
  let htMatch = false;
  if (htResult.includes('casa') || htResult === '1') {
    htMatch = homeScoreHT > awayScoreHT;
  } else if (htResult.includes('empate') || htResult === 'x') {
    htMatch = homeScoreHT === awayScoreHT;
  } else if (htResult.includes('fora') || htResult === '2') {
    htMatch = homeScoreHT < awayScoreHT;
  } else {
    return voidResult();
  }

  if (!htMatch) {
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true,
    };
  }

  let ftMatch = false;
  if (ftResult.includes('casa') || ftResult === '1') {
    ftMatch = homeScore > awayScore;
  } else if (ftResult.includes('empate') || ftResult === 'x') {
    ftMatch = homeScore === awayScore;
  } else if (ftResult.includes('fora') || ftResult === '2') {
    ftMatch = homeScore < awayScore;
  } else {
    return voidResult();
  }

  return {
    result: ftMatch ? Result.win : Result.lose,
    shouldUpdate: true,
    isFinalizableEarly: false,
  };
}
