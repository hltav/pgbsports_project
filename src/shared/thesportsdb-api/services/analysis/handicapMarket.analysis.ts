import { Result } from '@prisma/client';
import { EventMarketAnalysis } from './base.analysis';

// 3. HANDICAP EUROPEU
export function analyzeHandicapEuropeu(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  // Opções: -2, -1, +1, +2
  let handicap: number | null = null;

  const match = normalized.match(/([+-]?\d+)/);
  if (match) {
    handicap = parseInt(match[1], 10);
  }

  if (handicap === null) {
    return { result: Result.void, shouldUpdate: true };
  }

  // Nota: o handicap é do time CASA
  // Casa -1 significa: subtrair 1 do score da casa
  // Casa +1 significa: adicionar 1 ao score da casa

  const adjustedHomeScore = homeScore + handicap;
  const adjustedAwayScore = awayScore;

  let won = false;

  if (adjustedHomeScore > adjustedAwayScore) {
    won = true;
  } else {
    won = false;
  }

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
  };
}

// 4. HANDICAP ASIÁTICO
export function analyzeHandicapAsiatico(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  // Extrair handicap: -2.0, -1.75, -1.5, -1.25, -1, -0.75, -0.5, -0.25, 0, +0.25, etc
  const match = normalized.match(/([+-]?\d+\.?\d*)/);
  if (!match) {
    return { result: Result.void, shouldUpdate: true };
  }

  const handicap = parseFloat(match[1]);
  const adjustedHomeScore = homeScore + handicap;
  const adjustedAwayScore = awayScore - handicap;

  let result: Result = Result.lose;

  if (adjustedHomeScore > adjustedAwayScore) {
    result = Result.win;
  } else if (adjustedHomeScore === adjustedAwayScore) {
    // Handicap inteiro (sem decimais): empate = perda
    // Handicap com decimal (.5): nunca empata (0.5, 1.5, etc)
    // Handicap .25 ou .75: pode devolver metade (void)
    if (handicap % 1 === 0) {
      // Valores inteiros: -2, -1, 0, +1, +2
      result = Result.lose;
    } else if (handicap % 1 === 0.5) {
      // Valores .5: -1.5, -0.5, +0.5, +1.5 - nunca empatam
      result = Result.lose;
    } else {
      // Valores .25 ou .75: pode devolver metade
      result = Result.void;
    }
  } else {
    result = Result.lose;
  }

  return {
    result,
    shouldUpdate: true,
  };
}

// 5. HANDICAP POR TEMPO
export function analyzeHandicapPorTempo(
  eventDetails: string,
  homeScoreHT: number,
  awayScoreHT: number,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  // Opções: "Casa -0.5 1º Tempo" ou "Fora +0.5 2º Tempo"
  const isCasa = normalized.includes('casa');
  const isFora = normalized.includes('fora');

  let handicap: number | null = null;
  const match = normalized.match(/([+-]?\d+\.?\d*)/);
  if (match) {
    handicap = parseFloat(match[1]);
  }

  if (handicap === null) {
    return { result: Result.void, shouldUpdate: true };
  }

  let won = false;

  if (isCasa) {
    // Casa aposta com handicap
    const adjustedHome = homeScoreHT + handicap;
    const adjustedAway = awayScoreHT;
    won = adjustedHome > adjustedAway;
  } else if (isFora) {
    // Fora aposta com handicap
    const adjustedHome = homeScoreHT;
    const adjustedAway = awayScoreHT + handicap;
    won = adjustedAway > adjustedHome;
  }

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
  };
}
