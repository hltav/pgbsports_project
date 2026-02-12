import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

export function analyzeEmpateAnulaAposta(
  eventDetails: string,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  const apostouCasa =
    normalized.includes('casa') ||
    normalized.includes('home') ||
    normalized.includes('1');
  const apostouFora =
    normalized.includes('fora') ||
    normalized.includes('away') ||
    normalized.includes('2');

  // Mercado inválido
  if (!apostouCasa && !apostouFora) {
    return voidResult();
  }

  // 🔒 Não começou / sem score → não liquida
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

  // EAA/DNB só decide no FINISHED
  if (status !== MatchStatus.FINISHED) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // Jogo finalizado
  if (homeScore === awayScore) {
    return {
      result: Result.returned,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  if (apostouCasa) {
    return {
      result: homeScore > awayScore ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  // apostouFora
  return {
    result: awayScore > homeScore ? Result.win : Result.lose,
    shouldUpdate: true,
    isFinalizableEarly: false,
  };
}
