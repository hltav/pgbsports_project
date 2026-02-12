import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

export function analyzeGolsPrimeiroTempo(
  details: string,
  homeScoreHT: number | null,
  awayScoreHT: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const normalized = details.toLowerCase().trim();

  const isOver = normalized.includes('mais') || normalized.includes('over');
  const isUnder = normalized.includes('menos') || normalized.includes('under');

  const match = normalized.match(/\d+\.?\d*/);
  const threshold = match ? parseFloat(match[0]) : null;

  if (threshold == null || Number.isNaN(threshold)) return voidResult();
  if (!isOver && !isUnder) return voidResult();

  // 🔒 NOT_STARTED / sem HT
  if (
    status === MatchStatus.NOT_STARTED ||
    homeScoreHT == null ||
    awayScoreHT == null
  ) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  const totalHT = homeScoreHT + awayScoreHT;

  const htEnded =
    status === MatchStatus.HALF_TIME || status === MatchStatus.FINISHED;

  // ✅ Se HT terminou, decide definitivamente
  if (htEnded) {
    const won =
      (isOver && totalHT > threshold) || (isUnder && totalHT < threshold);

    return {
      result: won ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false, // não é “early”, é decisão do mercado
    };
  }

  // ✅ HT ainda rolando (FIRST_HALF / LIVE)
  // Over: pode ganhar cedo quando passa da linha (irreversível)
  if (isOver) {
    if (totalHT > threshold) {
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

  // Under:
  // - LOSE cedo se já não dá mais (ex: Under 0.5 e saiu 1 gol → perdeu e não volta)
  // - WIN nunca é cedo (pode sair gol)
  if (isUnder) {
    const loseEarly = totalHT >= threshold;
    // OBS: aqui assume linhas tipo 0.5/1.5/2.5 (mais comum).
    // Ex: Under 1.5 perde quando total >= 2 (como 2 > 1.5, e também >= já cobre).
    // Se você tiver linhas inteiras (1.0, 2.0), a regra pode mudar (returned).

    if (loseEarly) {
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

  return voidResult();
}
