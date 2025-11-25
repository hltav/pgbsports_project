import { Result } from '@prisma/client';
import { EventMarketAnalysis } from '../base.analysis';

export function analyzeAmbasMarcamEmAmbosTempos(
  eventDetails: string,
  homeScoreHT: number,
  awayScoreHT: number,
  homeScoreFT: number,
  awayScoreFT: number,
  isMatchFinished: boolean,
): EventMarketAnalysis {
  const isSim = eventDetails.toLowerCase().includes('sim');
  const isNao =
    eventDetails.toLowerCase().includes('não') ||
    eventDetails.toLowerCase().includes('nao');

  // Gols do 2º tempo
  const home2H = homeScoreFT - homeScoreHT;
  const away2H = awayScoreFT - awayScoreHT;

  // Condições
  const ambasNoHT = homeScoreHT > 0 && awayScoreHT > 0;
  const ambasNo2H = home2H > 0 && away2H > 0;
  const ambasNosDoisTempos = ambasNoHT && ambasNo2H;

  // JOGO FINALIZADO

  if (isMatchFinished) {
    if (isSim) {
      return {
        result: ambasNosDoisTempos ? Result.win : Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      };
    }

    if (isNao) {
      return {
        result: ambasNosDoisTempos ? Result.lose : Result.win,
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

  // JOGO EM ANDAMENTO - EARLY FINISH MODE

  // MERCADO SIM (precisa ambas no HT E ambas no 2H)

  if (isSim) {
    // ❌ LOSS ANTECIPADO: HT não teve ambas marcando
    // → Impossível de ganhar, pois falta a condição HT
    if (!ambasNoHT) {
      return {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    // ✅ WIN ANTECIPADO: HT teve ambas E 2H também teve ambas
    // → Ganhou, não há possibilidade de perder
    if (ambasNo2H) {
      return {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    // ⏳ APOSTA VIVA: HT ok, mas 2H ainda não teve ambas
    // → Espera: pode ganhar se 2H tiver ambas, ou perder se FT ficar sem ambas no 2H
    return {
      result: Result.lose, // default, mas aposta continua em aberto
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  // MERCADO NÃO (não pode ter ambas em ambos tempos)

  if (isNao) {
    // ✅ WIN ANTECIPADO: HT não teve ambas
    // → Já garantiu vitória, pois falta o HT com ambas
    if (!ambasNoHT) {
      return {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    // ❌ LOSS ANTECIPADO: HT teve ambas E 2H também teve ambas
    // → Perdeu, pois ocorreu a condição proibida
    if (ambasNo2H) {
      return {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      };
    }

    // ⏳ APOSTA VIVA: HT teve ambas, mas 2H não teve ambas
    // → Espera: pode ganhar se 2H terminar sem ambas, ou perder se 2H tiver ambas
    return {
      result: Result.lose, // default, mas aposta continua em aberto
      shouldUpdate: true,
      isFinalizableEarly: false,
    };
  }

  // Mercado inválido
  return {
    result: Result.void,
    shouldUpdate: true,
    isFinalizableEarly: true,
  };
}
