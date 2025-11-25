import { Result } from '@prisma/client';
import { EventMarketAnalysis, noUpdate, voidResult } from '../base.analysis';
import { EventStatus } from './../../../../../shared/thesportsdb-api/enums/eventStatus.enum';

// export function analyzeVencedor2oTempo(
//   eventDetails: string,
//   homeScoreHT: number,
//   awayScoreHT: number,
//   homeScoreFT: number,
//   awayScoreFT: number,
// ): EventMarketAnalysis {
//   const homeScore2ndHalf = homeScoreFT - homeScoreHT;
//   const awayScore2ndHalf = awayScoreFT - awayScoreHT;

//   if (eventDetails.includes('Casa')) {
//     return {
//       result: homeScore2ndHalf > awayScore2ndHalf ? Result.win : Result.lose,
//       shouldUpdate: true,
//       isFinalizableEarly: false,
//     };
//   }

//   if (eventDetails.includes('Empate')) {
//     return {
//       result: homeScore2ndHalf === awayScore2ndHalf ? Result.win : Result.lose,
//       shouldUpdate: true,
//       isFinalizableEarly: false,
//     };
//   }

//   if (eventDetails.includes('Fora')) {
//     return {
//       result: awayScore2ndHalf > homeScore2ndHalf ? Result.win : Result.lose,
//       shouldUpdate: true,
//       isFinalizableEarly: false,
//     };
//   }

//   return { result: Result.void, shouldUpdate: true };
// }

export function analyzeVencedor2oTempo(
  eventDetails: string,
  homeScoreHT: number | null,
  awayScoreHT: number | null,
  homeScoreFT: number | null,
  awayScoreFT: number | null,
  matchStatus: EventStatus,
): EventMarketAnalysis {
  // Normalizar texto
  const details = eventDetails.toLowerCase().trim();

  // Validação — dados insuficientes
  if (
    homeScoreHT == null ||
    awayScoreHT == null ||
    homeScoreFT == null ||
    awayScoreFT == null
  ) {
    return voidResult();
  }

  // ❗ Antes do fim da partida → não finalizar
  const matchFinished = matchStatus === EventStatus.FINISHED;
  if (!matchFinished) {
    return noUpdate();
  }

  // Placar do segundo tempo
  const home2H = homeScoreFT - homeScoreHT;
  const away2H = awayScoreFT - awayScoreHT;

  // CASA vence 2º tempo
  if (details.includes('casa')) {
    return {
      result: home2H > away2H ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  // FORA vence 2º tempo
  if (details.includes('fora')) {
    return {
      result: away2H > home2H ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  // EMPATE no 2º tempo
  if (details.includes('empate')) {
    return {
      result: home2H === away2H ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  // Caso nenhum dos termos seja encontrado → mercado inválido
  return voidResult();
}
