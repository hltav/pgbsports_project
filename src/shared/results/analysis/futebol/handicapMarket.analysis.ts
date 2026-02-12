import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

type HandicapPeriod = 'HT' | '2H';

export function analyzeHandicapPorTempo(
  eventDetails: string,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchStatus,
  period: HandicapPeriod,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  const isCasa = normalized.includes('casa') || normalized.includes('home');
  const isFora = normalized.includes('fora') || normalized.includes('away');

  if (!isCasa && !isFora) return voidResult();

  // 🔒 Não começou / sem score do período
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

  // Período encerrado?
  const htEnded =
    status === MatchStatus.HALF_TIME || status === MatchStatus.FINISHED;
  const secondHalfEnded = status === MatchStatus.FINISHED;

  const periodEnded = period === 'HT' ? htEnded : secondHalfEnded;

  // Se período ainda está em andamento → não liquida
  if (!periodEnded) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // Regex: captura handicap depois de "casa"/"fora"
  // Exemplos aceitos:
  // "Casa -0.5", "Fora +1", "Home -1.25"
  const match = normalized.match(
    /(?:casa|fora|home|away)\s*([+-]?\d+(?:\.\d+)?)/,
  );
  if (!match) return voidResult();

  const handicap = parseFloat(match[1]);
  if (Number.isNaN(handicap)) return voidResult();

  let won = false;

  if (isCasa) {
    const adjustedHome = homeScore + handicap;
    const adjustedAway = awayScore;
    won = adjustedHome > adjustedAway; // empate ajustado = lose (binário)
  } else {
    const adjustedHome = homeScore;
    const adjustedAway = awayScore + handicap;
    won = adjustedAway > adjustedHome;
  }

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
    isFinalizableEarly: false,
  };
}
