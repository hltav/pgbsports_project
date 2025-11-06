import { Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from './base.analysis';

// ⚽ Gols 1º Tempo (Over/Under)
export function analyzeGolsPrimeiroTempo(
  details: string,
  homeScoreHT: number,
  awayScoreHT: number,
): EventMarketAnalysis {
  const normalized = details.toLowerCase().trim();
  const totalGolsHT = homeScoreHT + awayScoreHT;

  const isMais = normalized.includes('mais') || normalized.includes('over');
  const isMenos = normalized.includes('menos') || normalized.includes('under');

  const match = normalized.match(/\d+\.?\d*/);
  const threshold = match ? parseFloat(match[0]) : null;

  if (threshold === null) {
    return voidResult();
  }

  let won = false;
  if (isMais && totalGolsHT > threshold) won = true;
  if (isMenos && totalGolsHT < threshold) won = true;

  let isFinalizableEarly = false;

  if (isMais) {
    isFinalizableEarly = won;
  } else if (isMenos) {
    isFinalizableEarly = totalGolsHT >= threshold;
  }

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
    isFinalizableEarly,
  };
}

// 🏆 Vencedor 1º Tempo (Corrigido para incluir isFinalizableEarly: false)
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
