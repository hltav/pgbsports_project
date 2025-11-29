// import { Result } from '@prisma/client';
// import { EventMarketAnalysis } from './base.analysis';

// 3️⃣ MERCADO: "Total Exato de Gols"
// Opções: "0", "1", "2", "3", "4", "5", "6+"
// export function analyzeTotalExatodeGols(
//   eventDetails: string,
//   homeScore: number,
//   awayScore: number,
// ): EventMarketAnalysis {
//   const totalGols = homeScore + awayScore;

//   if (eventDetails === '6+') {
//     return {
//       result: totalGols >= 6 ? Result.win : Result.lose,
//       shouldUpdate: true,
//     };
//   }

//   const expectedTotal = parseInt(eventDetails, 10);
//   return {
//     result: totalGols === expectedTotal ? Result.win : Result.lose,
//     shouldUpdate: true,
//   };
// }

// 4️⃣ MERCADO: "Equipe Marca"
// Opções: "Casa: Sim", "Casa: Não", "Fora: Sim", "Fora: Não"
// export function analyzeEquipeMarca(
//   eventDetails: string,
//   homeScore: number,
//   awayScore: number,
// ): EventMarketAnalysis {
//   const normalized = eventDetails.toLowerCase();

//   if (normalized.includes('casa: sim')) {
//     return {
//       result: homeScore > 0 ? Result.win : Result.lose,
//       shouldUpdate: true,
//     };
//   }

//   if (normalized.includes('casa: não') || normalized.includes('casa: nao')) {
//     return {
//       result: homeScore === 0 ? Result.win : Result.lose,
//       shouldUpdate: true,
//     };
//   }

//   if (normalized.includes('fora: sim')) {
//     return {
//       result: awayScore > 0 ? Result.win : Result.lose,
//       shouldUpdate: true,
//     };
//   }

//   if (normalized.includes('fora: não') || normalized.includes('fora: nao')) {
//     return {
//       result: awayScore === 0 ? Result.win : Result.lose,
//       shouldUpdate: true,
//     };
//   }

//   return { result: Result.void, shouldUpdate: true };
// }
// 2. EQUIPE MARCA
// export function analyzeEquipeMarca(
//   eventDetails: string,
//   homeScore: number,
//   awayScore: number,
// ): EventMarketAnalysis {
//   const normalized = eventDetails.toLowerCase().trim();

//   // Casa: Sim | Casa: Não | Fora: Sim | Fora: Não
//   const isCasa = normalized.includes('casa');
//   const isFora = normalized.includes('fora');
//   const isSim = normalized.includes('sim') || normalized.includes('yes');
//   const isNao = normalized.includes('não') || normalized.includes('no');

//   let won = false;

//   if (isCasa && isSim) {
//     won = homeScore > 0;
//   } else if (isCasa && isNao) {
//     won = homeScore === 0;
//   } else if (isFora && isSim) {
//     won = awayScore > 0;
//   } else if (isFora && isNao) {
//     won = awayScore === 0;
//   }

//   return {
//     result: won ? Result.win : Result.lose,
//     shouldUpdate: true,
//   };
// }

// 7️⃣ MERCADO: "Gol nos Dois Tempos"
// Opções: "Sim", "Não"

// 8️⃣ MERCADO: "Vence Sem Sofrer Gol"
// Opções: "Sim", "Não"
// export function analyzeVenceSemSofrerGol(
//   eventDetails: string,
//   homeScore: number,
//   awayScore: number,
// ): EventMarketAnalysis {
//   const casaVence = homeScore > awayScore && awayScore === 0;
//   const foraVence = awayScore > homeScore && homeScore === 0;
//   const alguemVenceu = casaVence || foraVence;

//   if (eventDetails.toLowerCase().includes('sim')) {
//     return {
//       result: alguemVenceu ? Result.win : Result.lose,
//       shouldUpdate: true,
//     };
//   }

//   if (
//     eventDetails.toLowerCase().includes('não') ||
//     eventDetails.toLowerCase().includes('nao')
//   ) {
//     return {
//       result: !alguemVenceu ? Result.win : Result.lose,
//       shouldUpdate: true,
//     };
//   }

//   return { result: Result.void, shouldUpdate: true };
// }
// // 7. VENCE SEM SOFRER GOL (CLEAN SHEET)
// export function analyzeVenceSemSofrerGol(
//   eventDetails: string,
//   homeScore: number,
//   awayScore: number,
// ): EventMarketAnalysis {
//   const normalized = eventDetails.toLowerCase().trim();

//   // Opções: "Sim" ou "Não"
//   const isSim = normalized.includes('sim') || normalized.includes('yes');

//   let won = false;

//   if (isSim) {
//     // Vencer sem sofrer gol = vencer E não levar gol
//     // Pode ser Casa ou Fora vencendo
//     if (homeScore > awayScore && awayScore === 0) {
//       won = true;
//     } else if (awayScore > homeScore && homeScore === 0) {
//       won = true;
//     }
//   } else {
//     // Não vencer sem sofrer gol
//     if (homeScore <= awayScore || awayScore > 0) {
//       won = true;
//     } else if (awayScore <= homeScore || homeScore > 0) {
//       won = true;
//     }
//     // Simplificando: se NÃO é vitória sem sofrer gol
//     won =
//       !(homeScore > awayScore && awayScore === 0) &&
//       !(awayScore > homeScore && homeScore === 0);
//   }

//   return {
//     result: won ? Result.win : Result.lose,
//     shouldUpdate: true,
//   };
// }
// 7. VENCE SEM SOFRER GOL (CLEAN SHEET)

// 9️⃣ MERCADO: "Número Par/Ímpar de Gols"
// Opções: "Par", "Ímpar"

// // 6. NÚMERO PAR/ÍMPAR DE GOLS
// export function analyzeNumeroParImpar(
//   eventDetails: string,
//   homeScore: number,
//   awayScore: number,
// ): EventMarketAnalysis {
//   const normalized = eventDetails.toLowerCase().trim();
//   const totalGols = homeScore + awayScore;

//   const isPar = normalized.includes('par');
//   const isImpar = normalized.includes('ímpar');

//   let won = false;

//   if (isPar) {
//     won = totalGols % 2 === 0;
//   } else if (isImpar) {
//     won = totalGols % 2 !== 0;
//   }

//   return {
//     result: won ? Result.win : Result.lose,
//     shouldUpdate: true,
//   };
// }

// // 1. TOTAL EXATO DE GOLS
// export function analyzeTotalExatoGols(
//   eventDetails: string,
//   homeScore: number,
//   awayScore: number,
// ): EventMarketAnalysis {
//   const normalized = eventDetails.toLowerCase().trim();
//   const totalGols = homeScore + awayScore;

//   let expectedGols: number | null = null;
//   let is6Plus = false;

//   // Extrair número exato ou "6+" para 6 ou mais
//   if (normalized.includes('6+')) {
//     is6Plus = true;
//     expectedGols = 6;
//   } else {
//     const match = normalized.match(/\d+/);
//     if (match) {
//       expectedGols = parseInt(match[0], 10);
//     }
//   }

//   if (expectedGols === null) {
//     return { result: Result.void, shouldUpdate: true };
//   }

//   let won = false;
//   let isFinalizableEarly = false;

//   if (is6Plus) {
//     won = totalGols >= 6;
//     isFinalizableEarly = totalGols >= 6; // Ganhou ou impossível virar perdedor
//   } else {
//     won = totalGols === expectedGols;
//     isFinalizableEarly = totalGols > expectedGols; // Passou do esperado, perdeu
//   }

//   return {
//     result: won ? Result.win : Result.lose,
//     shouldUpdate: true,
//     isFinalizableEarly,
//   };
// }

// 1. TOTAL EXATO DE GOLS
