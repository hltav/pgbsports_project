// import { Result } from '@prisma/client';
// import { EventMarketAnalysis } from './base.analysis';

// export function analyzeIntervaloFinal(
//   eventDetails: string,
//   homeScoreHT: number, // Placar casa no intervalo
//   awayScoreHT: number, // Placar fora no intervalo
//   homeScoreFT: number, // Placar casa final
//   awayScoreFT: number, // Placar fora final
//   isFinished: boolean, // Se a partida terminou
// ): EventMarketAnalysis {
//   const normalized = eventDetails.toLowerCase().trim();

//   // Mapeamento das combinações possíveis
//   const combinations = {
//     'casa/casa': { ht: 'casa', ft: 'casa' },
//     'casa/empate': { ht: 'casa', ft: 'empate' },
//     'casa/fora': { ht: 'casa', ft: 'fora' },
//     'empate/casa': { ht: 'empate', ft: 'casa' },
//     'empate/empate': { ht: 'empate', ft: 'empate' },
//     'empate/fora': { ht: 'empate', ft: 'fora' },
//     'fora/casa': { ht: 'fora', ft: 'casa' },
//     'fora/empate': { ht: 'fora', ft: 'empate' },
//     'fora/fora': { ht: 'fora', ft: 'fora' },
//   };

//   // Suporta também formato em inglês
//   const combinationsEN = {
//     'home/home': { ht: 'casa', ft: 'casa' },
//     'home/draw': { ht: 'casa', ft: 'empate' },
//     'home/away': { ht: 'casa', ft: 'fora' },
//     'draw/home': { ht: 'empate', ft: 'casa' },
//     'draw/draw': { ht: 'empate', ft: 'empate' },
//     'draw/away': { ht: 'empate', ft: 'fora' },
//     'away/home': { ht: 'fora', ft: 'casa' },
//     'away/draw': { ht: 'fora', ft: 'empate' },
//     'away/away': { ht: 'fora', ft: 'fora' },
//   };

//   // Encontra a combinação apostada
//   let expectedHT: string | null = null;
//   let expectedFT: string | null = null;

//   for (const [key, value] of Object.entries({
//     ...combinations,
//     ...combinationsEN,
//   })) {
//     if (normalized.includes(key)) {
//       expectedHT = value.ht;
//       expectedFT = value.ft;
//       break;
//     }
//   }

//   if (!expectedHT || !expectedFT) {
//     return {
//       result: Result.void,
//       shouldUpdate: true,
//       isFinalizableEarly: false,
//     };
//   }

//   // Determina o resultado do intervalo
//   const getResult = (home: number, away: number): string => {
//     if (home > away) return 'casa';
//     if (away > home) return 'fora';
//     return 'empate';
//   };

//   const actualHT = getResult(homeScoreHT, awayScoreHT);
//   const actualFT = getResult(homeScoreFT, awayScoreFT);

//   // Se o intervalo já não bate, podemos finalizar antecipadamente como perda
//   if (actualHT !== 'desconhecido' && actualHT !== expectedHT) {
//     return {
//       result: Result.lose,
//       shouldUpdate: true,
//       isFinalizableEarly: true, // Já perdeu no intervalo
//     };
//   }

//   // Se a partida terminou, verifica o resultado completo
//   if (isFinished) {
//     const won = actualHT === expectedHT && actualFT === expectedFT;
//     return {
//       result: won ? Result.win : Result.lose,
//       shouldUpdate: true,
//       isFinalizableEarly: false,
//     };
//   }

//   // Ainda em andamento, não pode decidir
//   return {
//     result: Result.pending,
//     shouldUpdate: false,
//     isFinalizableEarly: false,
//   };
// }

import { Result } from '@prisma/client';
import { EventMarketAnalysis, voidResult } from './base.analysis';

// ⚽ Gols 1º Tempo (Over/Under)
export function analyzeGolsPrimeiroTempo(
  details: string,
  homeScoreHT: number,
  awayScoreHT: number,
): EventMarketAnalysis {
  const normalized = details.toLowerCase().trim();
  const totalGolsHT = homeScoreHT + awayScoreHT;

  const isMais = normalized.includes('mais') || normalized.includes('over');
  const isMenos = normalized.includes('menos') || normalized.includes('under');

  const match = normalized.match(/\d+\.?\d*/);
  const threshold = match ? parseFloat(match[0]) : null;

  if (threshold === null) {
    return voidResult();
  }

  let won = false;
  if (isMais && totalGolsHT > threshold) won = true;
  if (isMenos && totalGolsHT < threshold) won = true;

  let isFinalizableEarly = false;

  if (isMais) {
    isFinalizableEarly = won;
  } else if (isMenos) {
    isFinalizableEarly = totalGolsHT >= threshold;
  }

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
    isFinalizableEarly,
  };
}

// 🏆 Vencedor 1º Tempo (Corrigido para incluir isFinalizableEarly: false)
export function analyzeVencedorPrimeiroTempo(
  details: string,
  homeScoreHT: number,
  awayScoreHT: number,
): EventMarketAnalysis {
  const detailsLower = details.toLowerCase();

  if (
    detailsLower.includes('casa') ||
    detailsLower.includes('home') ||
    detailsLower.includes('1')
  ) {
    return {
      result: homeScoreHT > awayScoreHT ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false, // Só finaliza no final do 1º tempo
    };
  }

  if (
    detailsLower.includes('empate') ||
    detailsLower.includes('draw') ||
    detailsLower.includes('x')
  ) {
    return {
      result: homeScoreHT === awayScoreHT ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false, // Só finaliza no final do 1º tempo
    };
  }

  if (
    detailsLower.includes('fora') ||
    detailsLower.includes('away') ||
    detailsLower.includes('2')
  ) {
    return {
      result: awayScoreHT > homeScoreHT ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: false, // Só finaliza no final do 1º tempo
    };
  }

  return voidResult();
}

// 🎯 Ambas Marcam 1º Tempo (Corrigido e Refatorado)
export function analyzeAmbasMarcamPrimeiroTempo(
  details: string,
  homeScoreHT: number,
  awayScoreHT: number,
): EventMarketAnalysis {
  const ambasMarcam = homeScoreHT > 0 && awayScoreHT > 0;
  const apostouSim =
    details.toLowerCase().includes('sim') ||
    details.toLowerCase().includes('yes');

  if (apostouSim) {
    return {
      result: ambasMarcam ? Result.win : Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: ambasMarcam,
    };
  } else {
    const isLost = ambasMarcam;

    return {
      result: isLost ? Result.lose : Result.win,
      shouldUpdate: true,
      isFinalizableEarly: isLost,
    };
  }
}

// 📊 Intervalo/Final (HT/FT)
export function analyzeIntervaloFinal(
  details: string,
  homeScoreHT: number,
  awayScoreHT: number,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const parts = details.split('/');

  if (parts.length !== 2) {
    return voidResult(); // ✅ Formato inválido
  }

  const [htResult, ftResult] = parts.map((s) => s.trim().toLowerCase());

  // Resultado do intervalo
  let htMatch = false;
  if (htResult.includes('casa') || htResult === '1') {
    htMatch = homeScoreHT > awayScoreHT;
  } else if (htResult.includes('empate') || htResult === 'x') {
    htMatch = homeScoreHT === awayScoreHT;
  } else if (htResult.includes('fora') || htResult === '2') {
    htMatch = homeScoreHT < awayScoreHT;
  } else {
    return voidResult(); // ✅ Opção não reconhecida
  }

  // Se o resultado do intervalo já está errado, já é red
  if (!htMatch) {
    return {
      result: Result.lose,
      shouldUpdate: true,
      isFinalizableEarly: true,
    };
  }

  // Resultado final (só confirma no final do jogo)
  let ftMatch = false;
  if (ftResult.includes('casa') || ftResult === '1') {
    ftMatch = homeScore > awayScore;
  } else if (ftResult.includes('empate') || ftResult === 'x') {
    ftMatch = homeScore === awayScore;
  } else if (ftResult.includes('fora') || ftResult === '2') {
    ftMatch = homeScore < awayScore;
  } else {
    return voidResult(); // ✅ Opção não reconhecida
  }

  return {
    result: ftMatch ? Result.win : Result.lose,
    shouldUpdate: true,
    isFinalizableEarly: false, // Precisa do placar final
  };
}
