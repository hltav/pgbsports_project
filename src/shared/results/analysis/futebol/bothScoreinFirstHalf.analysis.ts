import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

export function analyzeAmbasMarcamPrimeiroTempo(
  details: string,
  homeScoreHT: number | null,
  awayScoreHT: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const normalized = details.toLowerCase();

  const isSim = normalized.includes('sim') || normalized.includes('yes');
  const isNao =
    normalized.includes('não') ||
    normalized.includes('nao') ||
    normalized.includes('no');

  if (!isSim && !isNao) return voidResult();

  // 🔒 Guard 1: jogo não começou → nunca liquida
  if (status === MatchStatus.NOT_STARTED) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // 🔒 Guard 2: precisa de HT válido para qualquer lógica
  if (homeScoreHT == null || awayScoreHT == null) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  const ambasNoHT = homeScoreHT > 0 && awayScoreHT > 0;

  // ✅ Irreversível durante o 1º tempo: se ambas já marcaram no HT, acabou o mercado
  if (ambasNoHT) {
    if (isSim) {
      return {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }
    // isNao
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true,
    };
  }

  const htEnded =
    status === MatchStatus.HALF_TIME || status === MatchStatus.FINISHED;

  // ✅ HT terminou: agora dá pra decidir (sem “early” — é decisão do mercado)
  if (htEnded) {
    if (isSim) {
      return {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      };
    }
    // isNao
    return {
      result: Result.win,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  // ⏳ 1º tempo em andamento e ainda não houve ambas → aposta viva
  return {
    result: Result.pending,
    shouldUpdate: false,
    isFinalizableEarly: false,
  };
}
