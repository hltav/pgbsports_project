import { Result } from '@prisma/client';
import { EventMarketAnalysis } from '../base.analysis';

export function analyzeResultadoFinal(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  let won = false;

  if (eventDetails.includes('Casa') && homeScore > awayScore) won = true;
  if (eventDetails.includes('Empate') && homeScore === awayScore) won = true;
  if (eventDetails.includes('Fora') && awayScore > homeScore) won = true;

  return { result: won ? Result.win : Result.lose, shouldUpdate: true };
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
  homeScore: number,
  awayScore: number,
  isFinished: boolean,
): EventMarketAnalysis {
  const detail = eventDetails.trim();

  const isHomePick = detail.includes('Casa');
  const isDrawPick = detail.includes('Empate');
  const isAwayPick = detail.includes('Fora');

  // Seleção não reconhecida
  if (!isHomePick && !isDrawPick && !isAwayPick) {
    return {
      result: Result.void,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  //Analisa o placar a cada atualização.
  const homeDiff = homeScore - awayScore;
  const awayDiff = awayScore - homeScore;

  // ✅ Finalização antecipada (somente Casa/Fora)
  if (isHomePick && homeDiff >= 2) {
    return { result: Result.win, shouldUpdate: true, isFinalizableEarly: true };
  }

  if (isAwayPick && awayDiff >= 2) {
    return { result: Result.win, shouldUpdate: true, isFinalizableEarly: true };
  }

  // ✅ Se terminou, resolve definitivamente (inclusive Empate)
  if (isFinished) {
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

  // Ainda não abriu 2 gols e não terminou -> aguarda
  return {
    result: Result.pending,
    shouldUpdate: false,
    isFinalizableEarly: false,
  };
}
