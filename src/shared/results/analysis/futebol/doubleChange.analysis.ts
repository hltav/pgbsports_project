import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

export function analyzeDuplaChance(
  eventDetails: string,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  // 🔒 Guard: não começou / sem placar → não liquida
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

  // Dupla chance (1X / X2 / 12) é decidida no FT
  if (status !== MatchStatus.FINISHED) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  let won: boolean | null = null;

  // Aceita textos comuns PT
  if (normalized.includes('casa ou empate') || normalized.includes('1x')) {
    won = homeScore >= awayScore;
  } else if (
    normalized.includes('fora ou empate') ||
    normalized.includes('x2')
  ) {
    won = awayScore >= homeScore;
  } else if (normalized.includes('casa ou fora') || normalized.includes('12')) {
    won = homeScore !== awayScore;
  }

  if (won == null) return voidResult();

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
    isFinalizableEarly: false, // sem early aqui
  };
}
