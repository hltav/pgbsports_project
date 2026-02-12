import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

export function analyzeGolsSegundoTempo(
  details: string,
  homeScoreHT: number | null,
  awayScoreHT: number | null,
  homeScoreFT: number | null,
  awayScoreFT: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const normalized = details.toLowerCase().trim();

  const isOver = normalized.includes('mais') || normalized.includes('over');
  const isUnder = normalized.includes('menos') || normalized.includes('under');

  const match = normalized.match(/\d+\.?\d*/);
  const threshold = match ? parseFloat(match[0]) : null;

  if (threshold == null || Number.isNaN(threshold)) return voidResult();
  if (!isOver && !isUnder) return voidResult();

  // 🔒 Não começou / sem placares suficientes
  if (
    status === MatchStatus.NOT_STARTED ||
    homeScoreHT == null ||
    awayScoreHT == null ||
    homeScoreFT == null ||
    awayScoreFT == null
  ) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // Antes do 2º tempo começar, este mercado não pode ser resolvido
  const secondHalfOngoing =
    status === MatchStatus.SECOND_HALF || status === MatchStatus.LIVE;
  const finished = status === MatchStatus.FINISHED;

  if (!secondHalfOngoing && !finished) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // Gols do 2º tempo
  const home2H = homeScoreFT - homeScoreHT;
  const away2H = awayScoreFT - awayScoreHT;
  const total2H = home2H + away2H;

  const wonNow =
    (isOver && total2H > threshold) || (isUnder && total2H < threshold);

  // ✅ FINISHED: decisão final
  if (finished) {
    return {
      result: wonNow ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  // ✅ LIVE (2º tempo): early irreversível
  if (isOver) {
    if (total2H > threshold) {
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

  // isUnder
  // Under perde cedo se ultrapassou a linha (não volta)
  if (total2H > threshold) {
    return {
      result: Result.lose,
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
