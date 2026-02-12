import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from '../base.analysis';

export function analyzeResultadoFinal(
  eventDetails: string,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const detail = eventDetails.trim().toLowerCase();

  const isHomePick =
    detail.includes('casa') || detail.includes('home') || detail === '1';
  const isDrawPick =
    detail.includes('empate') || detail.includes('draw') || detail === 'x';
  const isAwayPick =
    detail.includes('fora') || detail.includes('away') || detail === '2';

  if (!isHomePick && !isDrawPick && !isAwayPick) return voidResult();

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

  if (status !== MatchStatus.FINISHED) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }

  let won = false;
  if (isHomePick && homeScore > awayScore) won = true;
  if (isDrawPick && homeScore === awayScore) won = true;
  if (isAwayPick && awayScore > homeScore) won = true;

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
    isFinalizableEarly: false,
  };
}

/**
 * Finaliza antecipado quando a equipe escolhida (Casa/Fora) abre 2 gols de vantagem.
 * E, quando o jogo estiver FINISHED, retorna o resultado definitivo (win/lose).
 *
 * Regras:
 * - Casa: ganha antecipado se (homeScore - awayScore) >= 2
 * - Fora: ganha antecipado se (awayScore - homeScore) >= 2
 * - Empate: nunca finaliza cedo; só decide no FINISHED (homeScore === awayScore)
 *
 * Retornos:
 * - Se atingiu condição antecipada: win + shouldUpdate true + isFinalizableEarly true
 * - Se não atingiu e NÃO terminou: pending + shouldUpdate false
 * - Se terminou (isFinished=true): win/lose definitivo + shouldUpdate true
 */
export function analyzeVencedorAntecipado(
  eventDetails: string,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const detail = eventDetails.trim().toLowerCase();

  const isHomePick =
    detail.includes('casa') || detail.includes('home') || detail === '1';
  const isDrawPick =
    detail.includes('empate') || detail.includes('draw') || detail === 'x';
  const isAwayPick =
    detail.includes('fora') || detail.includes('away') || detail === '2';

  if (!isHomePick && !isDrawPick && !isAwayPick) return voidResult();

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

  const homeDiff = homeScore - awayScore;
  const awayDiff = awayScore - homeScore;

  // ✅ Early WIN (somente Casa/Fora) quando abre 2 gols
  if (isHomePick && homeDiff >= 2) {
    return { result: Result.win, shouldUpdate: true, isFinalizableEarly: true };
  }

  if (isAwayPick && awayDiff >= 2) {
    return { result: Result.win, shouldUpdate: true, isFinalizableEarly: true };
  }

  // ✅ FINISHED: resolve definitivo
  if (status === MatchStatus.FINISHED) {
    let won = false;
    if (isHomePick && homeScore > awayScore) won = true;
    if (isDrawPick && homeScore === awayScore) won = true;
    if (isAwayPick && awayScore > homeScore) won = true;

    return {
      result: won ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  // ⏳ Ainda não bateu condição e não terminou
  return {
    result: Result.pending,
    shouldUpdate: false,
    isFinalizableEarly: false,
  };
}
