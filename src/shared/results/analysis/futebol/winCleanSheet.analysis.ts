import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

export function analyzeVenceSemSofrerGol(
  eventDetails: string,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  // Formatos esperados do front:
  // "Casa - Sim" | "Fora - Sim" | "Casa - Não" | "Fora - Não"
  const isCasa = normalized.includes('casa');
  const isFora = normalized.includes('fora');

  const isSim = normalized.includes('sim') || normalized.includes('yes');
  const isNao =
    normalized.includes('não') ||
    normalized.includes('nao') ||
    normalized.includes('no');

  // seleção inválida / ambígua
  if ((!isCasa && !isFora) || (!isSim && !isNao) || (isCasa && isFora)) {
    return voidResult();
  }

  // 🔒 NOT_STARTED / sem placar → não liquida
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

  const isFinished = status === MatchStatus.FINISHED;

  const teamGoals = isCasa ? homeScore : awayScore;
  const oppGoals = isCasa ? awayScore : homeScore;

  // "Vence sem sofrer" (win to nil) para o time escolhido:
  const winToNilHappened = teamGoals > oppGoals && oppGoals === 0;

  // ===== SIM =====
  if (isSim) {
    // ❌ LOSE early se sofreu gol (não dá mais pra "to nil")
    if (oppGoals > 0) {
      return {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    // ✅ FINISHED: decide definitivo
    if (isFinished) {
      return {
        result: winToNilHappened ? Result.win : Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      };
    }

    // ⏳ Ainda pode virar win (se ganhar 1-0, 2-0...) ou lose (se sofrer gol)
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // ===== NÃO =====
  // ✅ WIN early se sofreu gol (já garantiu que NÃO será "to nil")
  if (oppGoals > 0) {
    return { result: Result.win, shouldUpdate: true, isFinalizableEarly: true };
  }

  // ✅ FINISHED: ganha se NÃO aconteceu "to nil"
  if (isFinished) {
    return {
      result: winToNilHappened ? Result.lose : Result.win,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  // ⏳ Ainda pode acontecer "to nil" (o que faria o "Não" perder)
  return {
    result: Result.pending,
    shouldUpdate: false,
    isFinalizableEarly: false,
  };
}
