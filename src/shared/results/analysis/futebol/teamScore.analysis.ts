import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

export function analyzeEquipeMarca(
  eventDetails: string,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  // Casa: Sim | Casa: Não | Fora: Sim | Fora: Não
  const isCasa = normalized.includes('casa') || normalized.includes('home');
  const isFora = normalized.includes('fora') || normalized.includes('away');
  const isSim = normalized.includes('sim') || normalized.includes('yes');
  const isNao =
    normalized.includes('não') ||
    normalized.includes('nao') ||
    normalized.includes('no');

  // seleção inválida
  if ((!isCasa && !isFora) || (!isSim && !isNao) || (isCasa && isFora)) {
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

  const isFinished = status === MatchStatus.FINISHED;

  const teamScored = isCasa ? homeScore > 0 : awayScore > 0;

  // ===== "SIM" =====
  // WIN early quando o time marca
  if (isSim) {
    if (teamScored) {
      return {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }
    // se acabou e não marcou → LOSE
    if (isFinished) {
      return {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      };
    }
    // ainda pode marcar
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // ===== "NÃO" =====
  // LOSE early quando o time marca
  if (teamScored) {
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true,
    };
  }

  // WIN só quando terminar sem marcar
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
