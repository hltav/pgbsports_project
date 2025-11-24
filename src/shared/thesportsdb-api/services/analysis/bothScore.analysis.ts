import { Result } from '@prisma/client';
import { EventMarketAnalysis } from './base.analysis';

export function analyzeAmbasMarcam(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();
  const ambas = homeScore > 0 && awayScore > 0;
  const total = homeScore + awayScore;

  if (normalized.includes('ambos marcam - sim'))
    return {
      result: ambas ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true,
    };

  if (
    normalized.includes('ambos marcam - não') ||
    normalized.includes('ambos marcam - nao')
  )
    return {
      result: !ambas ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true,
    };

  if (normalized.includes('ambos marcam e +') && normalized.includes('2.5'))
    return {
      result: ambas && total > 2.5 ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true,
    };

  if (normalized.includes('ambos marcam ou +') && normalized.includes('2.5')) {
    if (ambas || total > 2.5) {
      return {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  return { result: Result.void, shouldUpdate: true, isFinalizableEarly: false };
}

export function analyzeAmbasMarcamEmAmbosTempos(
  eventDetails: string,
  homeScoreHT: number,
  awayScoreHT: number,
  homeScoreFT: number,
  awayScoreFT: number,
): EventMarketAnalysis {
  const isSim = eventDetails.toLowerCase().includes('sim');
  const isNao =
    eventDetails.toLowerCase().includes('não') ||
    eventDetails.toLowerCase().includes('nao');

  const homeScore2ndHalf = homeScoreFT - homeScoreHT;
  const awayScore2ndHalf = awayScoreFT - awayScoreHT;

  const ambasNoHT = homeScoreHT > 0 && awayScoreHT > 0;
  const ambasNo2ndHalf = homeScore2ndHalf > 0 && awayScore2ndHalf > 0;
  const ambasNosDoisTempos = ambasNoHT && ambasNo2ndHalf;

  //        MERCADO SIM

  if (isSim) {
    // Lose antecipado: nunca mais vai ter ambas no HT
    if (!ambasNoHT) {
      return {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    // Win antecipado: já cumpriu os 2 tempos
    if (ambasNosDoisTempos) {
      return {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    // Aposta viva: HT ok, mas 2T ainda não confirmou
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  //        MERCADO NÃO

  if (isNao) {
    // Win antecipado: impossível acontecer ambas no HT
    if (!ambasNoHT) {
      return {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    // Lose antecipado: já aconteceu ambas nos dois tempos
    if (ambasNosDoisTempos) {
      return {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    // Aposta viva: HT teve ambas, mas 2T ainda não confirmou
    return {
      result: Result.win,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  // Caso inválido
  return {
    result: Result.void,
    shouldUpdate: true,
    isFinalizableEarly: true,
  };
}
