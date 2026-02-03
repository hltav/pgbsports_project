import { Result } from '@prisma/client';
import { EventMarketAnalysis, noUpdate, voidResult } from '../base.analysis';

export function analyzeVencedor2oTempo(
  eventDetails: string,
  homeScoreHT: number | null,
  awayScoreHT: number | null,
  homeScoreFT: number | null,
  awayScoreFT: number | null,
  matchStatus: boolean,
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
  const matchFinished = matchStatus;
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
