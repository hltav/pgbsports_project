import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

/**
 * 📊 Ambas Marcam em Ambos Tempos (BTTS Both Halves)
 *
 * Regras seguras:
 * - NOT_STARTED → nunca liquida (pending)
 * - Sem HT válido → pending
 * - FINISHED → decide win/lose final
 *
 * Early finalize (somente quando irreversível e com status compatível):
 * - Mercado SIM:
 *   - LOSE early: apenas se o HT já terminou (HALF_TIME/FINISHED) e NÃO teve BTTS no HT
 *   - WIN early: quando já houve BTTS no HT e já houve BTTS no 2º tempo
 * - Mercado NÃO:
 *   - WIN early: apenas se o HT já terminou e NÃO teve BTTS no HT (impossível ocorrer em ambos tempos)
 *   - LOSE early: quando já ocorreu BTTS no HT e no 2º tempo
 */
export function analyzeAmbasMarcamEmAmbosTempos(
  eventDetails: string,
  homeScoreHT: number | null,
  awayScoreHT: number | null,
  homeScoreFT: number | null,
  awayScoreFT: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase();

  const isSim = normalized.includes('sim');
  const isNao = normalized.includes('não') || normalized.includes('nao');

  if (!isSim && !isNao) return voidResult();

  // 🔒 Guard 1: jogo não começou → nunca liquida
  if (status === MatchStatus.NOT_STARTED) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // 🔒 Guard 2: precisa de HT válido para qualquer decisão séria
  if (homeScoreHT == null || awayScoreHT == null) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  const htEnded =
    status === MatchStatus.HALF_TIME || status === MatchStatus.FINISHED;
  const isFinished = status === MatchStatus.FINISHED;

  // Condição do HT
  const ambasNoHT = homeScoreHT > 0 && awayScoreHT > 0;

  // Para avaliar 2º tempo, precisamos de FT (e HT)
  const hasFT = homeScoreFT != null && awayScoreFT != null;

  // Se não temos FT ainda, só dá pra decidir coisas baseadas em HT (quando HT já encerrou)
  if (!hasFT) {
    // Mercado SIM: se HT acabou e não teve ambas no HT, é LOSE garantido
    if (isSim && htEnded && !ambasNoHT) {
      return {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    // Mercado NÃO: se HT acabou e não teve ambas no HT, é WIN garantido
    if (isNao && htEnded && !ambasNoHT) {
      return {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    // Caso contrário, ainda não dá pra cravar
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // Agora temos FT + HT: podemos calcular 2H
  const home2H = homeScoreFT - homeScoreHT;
  const away2H = awayScoreFT - awayScoreHT;

  const ambasNo2H = home2H > 0 && away2H > 0;
  const ambasNosDoisTempos = ambasNoHT && ambasNo2H;

  // ✅ JOGO FINALIZADO → decisão final
  if (isFinished) {
    if (isSim) {
      return {
        result: ambasNosDoisTempos ? Result.win : Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      };
    }

    // isNao
    return {
      result: ambasNosDoisTempos ? Result.lose : Result.win,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  // ✅ JOGO EM ANDAMENTO (ou intervalo) — Early finalize seguro

  if (isSim) {
    // LOSE early: HT já encerrou e não teve ambas no HT → impossível cumprir “ambos tempos”
    if (htEnded && !ambasNoHT) {
      return {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    // WIN early: HT teve ambas e 2H já teve ambas → irreversível
    if (ambasNoHT && ambasNo2H) {
      return {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    // Ainda pode virar
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // isNao
  // WIN early: HT encerrou sem ambas no HT → impossível ocorrer “ambos tempos”
  if (htEnded && !ambasNoHT) {
    return { result: Result.win, shouldUpdate: true, isFinalizableEarly: true };
  }

  // LOSE early: já aconteceu “ambos tempos”
  if (ambasNosDoisTempos) {
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
