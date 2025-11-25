import { Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from './base.analysis';

// 🏆 Vencedor 2º Tempo
export function analyzeVencedor2oTempo(
  eventDetails: string,
  homeScoreHT: number,
  awayScoreHT: number,
  homeScoreFT: number,
  awayScoreFT: number,
): EventMarketAnalysis {
  const homeScore2ndHalf = homeScoreFT - homeScoreHT;
  const awayScore2ndHalf = awayScoreFT - awayScoreHT;

  if (eventDetails.includes('Casa')) {
    return {
      result: homeScore2ndHalf > awayScore2ndHalf ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  if (eventDetails.includes('Empate')) {
    return {
      result: homeScore2ndHalf === awayScore2ndHalf ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  if (eventDetails.includes('Fora')) {
    return {
      result: awayScore2ndHalf > homeScore2ndHalf ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  return { result: Result.void, shouldUpdate: true };
}

// 🎯 Ambas Marcam 1º Tempo (Corrigido e Refatorado)
export function analyzeAmbasMarcamPrimeiroTempo(
  details: string,
  homeScoreHT: number,
  awayScoreHT: number,
): EventMarketAnalysis {
  const ambasMarcam = homeScoreHT > 0 && awayScoreHT > 0;
  const apostouSim =
    details.toLowerCase().includes('sim') ||
    details.toLowerCase().includes('yes');

  if (apostouSim) {
    return {
      result: ambasMarcam ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: ambasMarcam,
    };
  } else {
    const isLost = ambasMarcam;

    return {
      result: isLost ? Result.lose : Result.win,
      shouldUpdate: true,
      isFinalizableEarly: isLost,
    };
  }
}

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
