import { Result } from '@prisma/client';
import { EventMarketAnalysis } from '../base.analysis';

export function analyzeEmpateAnulaAposta(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
  isMatchFinished: boolean,
): EventMarketAnalysis {
  const apostouCasa = eventDetails.toLowerCase().includes('casa');
  const apostouFora = eventDetails.toLowerCase().includes('fora');

  // Mercado inválido
  if (!apostouCasa && !apostouFora) {
    return {
      result: Result.void,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }
  // O jogo AINDA NÃO terminou → nunca pode finalizar EAA
  if (!isMatchFinished) {
    return {
      result: Result.pending,
      shouldUpdate: false,
      isFinalizableEarly: false,
    };
  }
  //       JOGO FINALIZADO
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

  if (apostouFora) {
    return {
      result: awayScore > homeScore ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  return {
    result: Result.void,
    shouldUpdate: true,
    isFinalizableEarly: false,
  };
}
