import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

export function analyzeGolNosDoisTempos(
  eventDetails: string,
  homeScoreHT: number | null,
  awayScoreHT: number | null,
  homeScoreFT: number | null,
  awayScoreFT: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  const isSim = normalized.includes('sim') || normalized.includes('yes');
  const isNao =
    normalized.includes('não') ||
    normalized.includes('nao') ||
    normalized.includes('no');

  if (!isSim && !isNao) return voidResult();

  // 🔒 NOT_STARTED / sem HT → não liquida
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

  const golsHT = homeScoreHT + awayScoreHT > 0;

  const htEnded =
    status === MatchStatus.HALF_TIME || status === MatchStatus.FINISHED;
  const isFinished = status === MatchStatus.FINISHED;

  const hasFT = homeScoreFT != null && awayScoreFT != null;

  // Se não temos FT ainda, não dá pra afirmar 2º tempo
  if (!hasFT) {
    // Se HT acabou sem gol, é impossível ter gol nos dois tempos
    if (htEnded && !golsHT) {
      if (isSim) {
        return {
          result: Result.lose,
          shouldUpdate: true,
          isFinalizableEarly: true,
        };
      }
      // isNao
      return {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    // Ainda pode acontecer
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  const home2H = homeScoreFT - homeScoreHT;
  const away2H = awayScoreFT - awayScoreHT;
  const gols2H = home2H + away2H > 0;

  const houveSim = golsHT && gols2H;

  // ✅ FINISHED: decide definitivo
  if (isFinished) {
    if (isSim) {
      return {
        result: houveSim ? Result.win : Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      };
    }
    // isNao
    return {
      result: houveSim ? Result.lose : Result.win,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  // ✅ EARLY (irreversível)
  // Se já ocorreu gol nos dois tempos, é irreversível
  if (houveSim) {
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

  // Se HT já acabou sem gol, é irreversível (não dá pra ocorrer “nos dois tempos”)
  if (htEnded && !golsHT) {
    if (isSim) {
      return {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }
    // isNao
    return { result: Result.win, shouldUpdate: true, isFinalizableEarly: true };
  }

  // ⏳ Ainda pode acontecer
  return {
    result: Result.pending,
    shouldUpdate: false,
    isFinalizableEarly: false,
  };
}
