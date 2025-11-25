import { Result } from '@prisma/client';
import { EventMarketAnalysis } from '../base.analysis';

type MatchStatus = 'first_half' | 'half_time' | 'second_half';

export function analyzeGolsSegundoTempo(
  details: string,
  homeScoreHT: number,
  awayScoreHT: number,
  homeScoreFT: number,
  awayScoreFT: number,
  matchStatus: MatchStatus = 'second_half',
): EventMarketAnalysis {
  const normalized = details.toLowerCase().trim();

  // ===== CALCULA GOLS DO 2º TEMPO =====
  const home2H = homeScoreFT - homeScoreHT;
  const away2H = awayScoreFT - awayScoreHT;
  const totalGols2H = home2H + away2H;

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
    (isOver && totalGols2H > threshold) || (isUnder && totalGols2H < threshold);

  const isAlreadyImpossible = isGoalsImpossible2H(
    totalGols2H,
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

  // Se AINDA está em segundo tempo, aposta está viva (pode haver gols)
  if (matchStatus === 'second_half') {
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false, // Pode mudar até FT
    };
  }

  // Se JÁ está finalizado, resultado é definitivo
  if (matchStatus === 'half_time') {
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true, // Resultado final do 2H
    };
  }

  // Por segurança, se status for first_half (improvável pra 2H), trata como live
  if (matchStatus === 'first_half') {
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false,
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
export function isGoalsImpossible2H(
  totalGols2H: number,
  threshold: number,
  isOver: boolean,
  isUnder: boolean,
): boolean {
  if (isOver) {
    // OVER: se gols >= threshold, não pode mais ganhar
    return totalGols2H >= threshold;
  }

  if (isUnder) {
    // UNDER: se gols >= threshold, não pode mais ganhar
    return totalGols2H >= threshold;
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
