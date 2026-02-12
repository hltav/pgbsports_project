import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

export function analyzeTotalGols(
  eventDetails: string,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  const isOver = normalized.includes('mais') || normalized.includes('over');
  const isUnder = normalized.includes('menos') || normalized.includes('under');

  const match = normalized.match(/\d+\.?\d*/);
  const threshold = match ? parseFloat(match[0]) : null;

  if ((!isOver && !isUnder) || threshold == null || Number.isNaN(threshold)) {
    return voidResult();
  }

  // 🔒 NOT_STARTED / sem score → não liquida
  if (
    status === MatchStatus.NOT_STARTED ||
    homeScore == null ||
    awayScore == null
  ) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  const totalGols = homeScore + awayScore;
  const isFinished = status === MatchStatus.FINISHED;

  // ===== OVER =====
  if (isOver) {
    // WIN irreversível quando passa da linha
    if (totalGols > threshold) {
      return {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    // Se terminou e não passou → LOSE
    if (isFinished) {
      return {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      };
    }

    // Ainda pode virar
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // ===== UNDER =====
  // LOSE irreversível quando passa da linha
  if (totalGols > threshold) {
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true,
    };
  }

  // WIN só quando terminar sem passar
  if (isFinished) {
    return {
      result: Result.win,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  return {
    result: Result.pending,
    shouldUpdate: false,
    isFinalizableEarly: false,
  };
}
