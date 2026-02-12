import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

export function analyzePlacarExatoImproved(
  eventDetails: string,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const normalized = eventDetails.trim();

  // NOT_STARTED / sem score → não liquida
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

  // Aceita "1-0" ou "1x0"
  const parts = normalized.split(/[-x]/i);
  if (parts.length !== 2) return voidResult();

  const expectedHome = parseInt(parts[0].trim(), 10);
  const expectedAway = parseInt(parts[1].trim(), 10);

  if (Number.isNaN(expectedHome) || Number.isNaN(expectedAway)) {
    return voidResult();
  }

  const won = homeScore === expectedHome && awayScore === expectedAway;

  // ✅ Jogo finalizado → decisão final
  if (status === MatchStatus.FINISHED) {
    return {
      result: won ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  // ✅ Early LOSE: impossível bater o placar exato se já passou do esperado
  const impossible = homeScore > expectedHome || awayScore > expectedAway;
  if (impossible) {
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true,
    };
  }

  // ⏳ Ainda pode acontecer (mesmo se estiver “batendo” agora, pode mudar depois)
  return {
    result: Result.pending,
    shouldUpdate: false,
    isFinalizableEarly: false,
  };
}
