import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

export function analyzeTotalExatoGols(
  eventDetails: string,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

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

  let expectedGols: number | null = null;
  let is6Plus = false;

  // Extrair número exato ou "6+"
  if (normalized.includes('6+')) {
    is6Plus = true;
    expectedGols = 6;
  } else {
    const match = normalized.match(/\d+/);
    if (match) expectedGols = parseInt(match[0], 10);
  }

  if (expectedGols == null || Number.isNaN(expectedGols)) return voidResult();

  // ✅ Caso especial: 6+
  if (is6Plus) {
    // WIN irreversível quando chega em 6
    if (totalGols >= 6) {
      return {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    // Se terminou e não chegou em 6 → LOSE
    if (status === MatchStatus.FINISHED) {
      return {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      };
    }

    // Ainda pode chegar
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // ✅ Total exato N:
  // LOSE irreversível se passou do esperado
  if (totalGols > expectedGols) {
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true,
    };
  }

  // Se terminou: decide (WIN se total == esperado, senão LOSE)
  if (status === MatchStatus.FINISHED) {
    return {
      result: totalGols === expectedGols ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  // Live e ainda não passou → aposta viva (mesmo se estiver igual agora)
  return {
    result: Result.pending,
    shouldUpdate: false,
    isFinalizableEarly: false,
  };
}
