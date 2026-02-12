import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

export function analyzeAmbasMarcam(
  eventDetails: string,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  // NOT_STARTED / sem placar → nunca liquida
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

  const ambas = homeScore > 0 && awayScore > 0;
  const total = homeScore + awayScore;
  const isFinished = status === MatchStatus.FINISHED;

  const wantsSim =
    normalized.includes('- sim') ||
    normalized.endsWith(' sim') ||
    normalized.includes(' yes');
  const wantsNao =
    normalized.includes('- não') ||
    normalized.includes('- nao') ||
    normalized.endsWith(' nao') ||
    normalized.includes(' no');

  // Helpers
  const settlePending = (): EventMarketAnalysis => ({
    result: Result.pending,
    shouldUpdate: false,
    isFinalizableEarly: false,
  });

  // --- 1) BTTS simples: "Ambos marcam - Sim/Não"
  const isSimpleBtts =
    normalized.includes('ambos marcam -') || normalized.includes('btts');

  if (
    isSimpleBtts &&
    !normalized.includes('ou +') &&
    !normalized.includes('e +')
  ) {
    if (wantsSim) {
      if (ambas)
        return {
          result: Result.win,
          shouldUpdate: true,
          isFinalizableEarly: true,
        };
      if (isFinished)
        return {
          result: Result.lose,
          shouldUpdate: true,
          isFinalizableEarly: false,
        };
      return settlePending();
    }

    if (wantsNao) {
      if (ambas)
        return {
          result: Result.lose,
          shouldUpdate: true,
          isFinalizableEarly: true,
        };
      if (isFinished)
        return {
          result: Result.win,
          shouldUpdate: true,
          isFinalizableEarly: false,
        };
      return settlePending();
    }

    return voidResult();
  }

  // --- 2) "Ambos marcam e + 2.5 gols - Sim/Não"
  const isAndOver25 =
    normalized.includes('ambos marcam e +') && normalized.includes('2.5');
  if (isAndOver25) {
    const condition = ambas && total > 2.5;

    if (wantsSim) {
      if (condition)
        return {
          result: Result.win,
          shouldUpdate: true,
          isFinalizableEarly: true,
        };
      if (isFinished)
        return {
          result: Result.lose,
          shouldUpdate: true,
          isFinalizableEarly: false,
        };
      return settlePending();
    }

    if (wantsNao) {
      // complemento: NÃO quer que a condição aconteça
      if (condition)
        return {
          result: Result.lose,
          shouldUpdate: true,
          isFinalizableEarly: true,
        };
      if (isFinished)
        return {
          result: Result.win,
          shouldUpdate: true,
          isFinalizableEarly: false,
        };
      return settlePending();
    }

    return voidResult();
  }

  // --- 3) "Ambos marcam ou + 2.5 gols - Sim/Não"
  const isOrOver25 =
    normalized.includes('ambos marcam ou +') && normalized.includes('2.5');
  if (isOrOver25) {
    const condition = ambas || total > 2.5;

    if (wantsSim) {
      if (condition)
        return {
          result: Result.win,
          shouldUpdate: true,
          isFinalizableEarly: true,
        };
      if (isFinished)
        return {
          result: Result.lose,
          shouldUpdate: true,
          isFinalizableEarly: false,
        };
      return settlePending();
    }

    if (wantsNao) {
      // complemento: NÃO quer que a condição aconteça
      if (condition)
        return {
          result: Result.lose,
          shouldUpdate: true,
          isFinalizableEarly: true,
        };
      if (isFinished)
        return {
          result: Result.win,
          shouldUpdate: true,
          isFinalizableEarly: false,
        };
      return settlePending();
    }

    return voidResult();
  }

  return voidResult();
}
