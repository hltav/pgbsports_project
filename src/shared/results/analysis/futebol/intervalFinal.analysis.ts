import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

// 📊 Intervalo/Final (HT/FT)
export function analyzeIntervaloFinal(
  details: string,
  homeScoreHT: number | null,
  awayScoreHT: number | null,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const parts = details.split('/');

  if (parts.length !== 2) {
    return voidResult();
  }

  const [htResult, ftResult] = parts.map((s) => s.trim().toLowerCase());

  // 🔒 Guard 1: jogo não começou → nunca analisa/liquida
  if (status === MatchStatus.NOT_STARTED) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // 🔒 Guard 2: ainda não temos HT válido → não dá pra decidir HT/FT
  // (na prática, HT/FT só fica decidível a partir do intervalo; e o FT só no FINISHED)
  if (homeScoreHT == null || awayScoreHT == null) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // Resultado do intervalo
  let htMatch = false;

  if (htResult.includes('casa') || htResult === '1') {
    htMatch = homeScoreHT > awayScoreHT;
  } else if (htResult.includes('empate') || htResult === 'x') {
    htMatch = homeScoreHT === awayScoreHT;
  } else if (htResult.includes('fora') || htResult === '2') {
    htMatch = homeScoreHT < awayScoreHT;
  } else {
    return voidResult();
  }

  // Se o resultado do intervalo NÃO bate:
  // ✅ Só podemos finalizar cedo quando o HT já é definitivo (HALF_TIME ou FINISHED)
  if (!htMatch) {
    const htIsDefinitive =
      status === MatchStatus.HALF_TIME || status === MatchStatus.FINISHED;

    if (!htIsDefinitive) {
      // 1º tempo ainda rolando / status incerto → não liquida
      return {
        result: Result.pending,
        shouldUpdate: false,
        isFinalizableEarly: false,
      };
    }

    // Intervalo confirmado e HT já não bateu → é LOSE garantido
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true, // liquida já no intervalo
    };
  }

  // Se HT bateu, precisamos do FT para decidir win/lose
  // 🔒 Guard 3: sem FT válido → não liquida
  if (homeScore == null || awayScore == null) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // 🔒 Guard 4: ainda não terminou → não dá pra cravar o FT
  if (status !== MatchStatus.FINISHED) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  // Resultado final
  let ftMatch = false;

  if (ftResult.includes('casa') || ftResult === '1') {
    ftMatch = homeScore > awayScore;
  } else if (ftResult.includes('empate') || ftResult === 'x') {
    ftMatch = homeScore === awayScore;
  } else if (ftResult.includes('fora') || ftResult === '2') {
    ftMatch = homeScore < awayScore;
  } else {
    return voidResult();
  }

  return {
    result: ftMatch ? Result.win : Result.lose,
    shouldUpdate: true, // só liquida no FINISHED
    isFinalizableEarly: false,
  };
}
