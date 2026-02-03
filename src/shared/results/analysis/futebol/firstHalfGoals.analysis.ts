import { Result } from '@prisma/client';
import { EventMarketAnalysis } from '../base.analysis';

type MatchStatus = 'first_half' | 'half_time' | 'second_half';

export function analyzeGolsPrimeiroTempo(
  details: string,
  homeScoreHT: number,
  awayScoreHT: number,
  matchStatus: MatchStatus = 'half_time',
): EventMarketAnalysis {
  const normalized = details.toLowerCase().trim();
  const totalGolsHT = homeScoreHT + awayScoreHT;

  const isOver = normalized.includes('mais') || normalized.includes('over');
  const isUnder = normalized.includes('menos') || normalized.includes('under');

  const match = normalized.match(/\d+\.?\d*/);
  const threshold = match ? parseFloat(match[0]) : null;

  // ===== VALIDAÇÃO =====
  if (threshold === null) {
    return voidResult();
  }

  if (!isOver && !isUnder) {
    return voidResult();
  }

  // ===== CÁLCULO DO RESULTADO =====
  const won =
    (isOver && totalGolsHT > threshold) || (isUnder && totalGolsHT < threshold);

  const isAlreadyImpossible = isGoalsImpossible(
    totalGolsHT,
    threshold,
    isOver,
    isUnder,
  );

  // ===== DECISÃO EARLY FINISH =====

  // Se já venceu
  if (won) {
    return {
      result: Result.win,
      shouldUpdate: true,
      isFinalizableEarly: true,
    };
  }

  // Se já é impossível vencer
  if (isAlreadyImpossible) {
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true,
    };
  }

  // ===== APOSTA VIVA - DEPENDE DO STATUS =====

  // Se AINDA está em primeiro tempo, aposta está viva (pode haver gols)
  if (matchStatus === 'first_half') {
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false, // Pode mudar até FT
    };
  }

  // Se JÁ está no intervalo (half_time), não muda mais
  // Resultado é definitivo e deve finalizar
  if (matchStatus === 'half_time') {
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true, // Resultado final do HT
    };
  }

  // Se já entrou no segundo tempo, é definitivo
  if (matchStatus === 'second_half') {
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true, // Resultado final do HT
    };
  }

  return {
    result: Result.lose,
    shouldUpdate: true,
    isFinalizableEarly: false,
  };
}

/**
 * Verifica se já é impossível atingir a meta de gols
 *
 * OVER: impossível se já chegou/ultrapassou o threshold
 * UNDER: impossível se já chegou/ultrapassou o threshold
 */
export function isGoalsImpossible(
  totalGolsHT: number,
  threshold: number,
  isOver: boolean,
  isUnder: boolean,
): boolean {
  if (isOver) {
    // OVER: se gols >= threshold, não pode mais ganhar (não vai voltar pra trás)
    return totalGolsHT >= threshold;
  }

  if (isUnder) {
    // UNDER: se gols >= threshold, não pode mais ganhar (não vai voltar pra trás)
    return totalGolsHT >= threshold;
  }

  return false;
}

function voidResult(): EventMarketAnalysis {
  return {
    result: Result.void,
    shouldUpdate: true,
    isFinalizableEarly: false,
  };
}
