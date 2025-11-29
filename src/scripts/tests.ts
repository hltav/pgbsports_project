// import { Result } from '@prisma/client';
// import {
//   analyzeEquipeMarca,
//   analyzeParOuImpar,
//   analyzeTotalExatoGols,
//   analyzeVenceSemSofrerGol,
// } from './../shared/thesportsdb-api/services/analysis/goalsMarket.analysis';
// import {
//   analyzeHandicapEuropeu,
//   analyzeHandicapAsiatico,
//   analyzeHandicapPorTempo,
// } from '../shared/thesportsdb-api/services/analysis/futebol/handicapMarket.analysis';
// import { EventMarketAnalysis } from './../shared/thesportsdb-api/services/analysis/base.analysis';

// interface TestCase {
//   scenario: string;
//   details: string;
//   homeScore: number;
//   awayScore: number;
//   homeScoreHT?: number;
//   awayScoreHT?: number;
//   expected: { result: Result; isFinalizableEarly?: boolean };
// }

// type AnalyzeFunction = (
//   details: string,
//   homeScore: number,
//   awayScore: number,
//   homeScoreHT?: number,
//   awayScoreHT?: number,
// ) => EventMarketAnalysis;

// function runTests(
//   functionName: string,
//   testCases: TestCase[],
//   analyzeFn: AnalyzeFunction,
// ): void {
//   console.log(`\n📊 Testando: ${functionName}\n`);

//   let passedCount = 0;
//   let failedCount = 0;

//   testCases.forEach((test) => {
//     const result: EventMarketAnalysis =
//       test.homeScoreHT !== undefined && test.awayScoreHT !== undefined
//         ? analyzeFn(
//             test.details,
//             test.homeScore,
//             test.awayScore,
//             test.homeScoreHT,
//             test.awayScoreHT,
//           )
//         : analyzeFn(test.details, test.homeScore, test.awayScore);

//     const isFinalizableEarly = result.isFinalizableEarly ?? false;
//     const expectedIsFinalizableEarly =
//       test.expected.isFinalizableEarly ?? false;

//     const passed =
//       result.result === test.expected.result &&
//       isFinalizableEarly === expectedIsFinalizableEarly;

//     if (passed) {
//       passedCount++;
//     } else {
//       failedCount++;
//     }

//     console.log(
//       `${passed ? '✅' : '❌'} ${test.scenario} → ${Result[result.result]} (finalizável: ${isFinalizableEarly})`,
//     );

//     if (!passed) {
//       console.log(
//         `   Esperado: ${Result[test.expected.result]} (finalizável: ${expectedIsFinalizableEarly})`,
//       );
//     }
//   });

//   console.log(
//     `\n📈 Resumo: ${passedCount} passou${passedCount !== 1 ? 's' : ''}, ${failedCount} falhou${failedCount !== 1 ? '' : ''}\n`,
//   );
// }

// // ==================== TESTES ====================

// function run(): void {
//   // 1. TOTAL EXATO DE GOLS
//   const totalExatoTests: TestCase[] = [
//     {
//       scenario: 'Esperado 2 gols, Atual 0x0',
//       details: '2',
//       homeScore: 0,
//       awayScore: 0,
//       expected: { result: Result.lose, isFinalizableEarly: false },
//     },
//     {
//       scenario: 'Esperado 2 gols, Atual 1x1',
//       details: '2',
//       homeScore: 1,
//       awayScore: 1,
//       expected: { result: Result.win, isFinalizableEarly: true },
//     },
//     {
//       scenario: 'Esperado 2 gols, Atual 3x1 (impossível)',
//       details: '2',
//       homeScore: 3,
//       awayScore: 1,
//       expected: { result: Result.lose, isFinalizableEarly: true },
//     },
//     {
//       scenario: 'Esperado 6+ gols, Atual 3x3',
//       details: '6+',
//       homeScore: 3,
//       awayScore: 3,
//       expected: { result: Result.win, isFinalizableEarly: true },
//     },
//     {
//       scenario: 'Esperado 6+ gols, Atual 2x2',
//       details: '6+',
//       homeScore: 2,
//       awayScore: 2,
//       expected: { result: Result.lose, isFinalizableEarly: false },
//     },
//   ];
//   runTests('analyzeTotalExatoGols', totalExatoTests, analyzeTotalExatoGols);

//   // 2. EQUIPE MARCA
//   const equipeMarcaTests: TestCase[] = [
//     {
//       scenario: 'Casa marca - Sim, Atual 1x0',
//       details: 'Casa: Sim',
//       homeScore: 1,
//       awayScore: 0,
//       expected: { result: Result.win },
//     },
//     {
//       scenario: 'Casa marca - Sim, Atual 0x1',
//       details: 'Casa: Sim',
//       homeScore: 0,
//       awayScore: 1,
//       expected: { result: Result.lose },
//     },
//     {
//       scenario: 'Casa marca - Não, Atual 0x2',
//       details: 'Casa: Não',
//       homeScore: 0,
//       awayScore: 2,
//       expected: { result: Result.win },
//     },
//     {
//       scenario: 'Fora marca - Sim, Atual 2x1',
//       details: 'Fora: Sim',
//       homeScore: 2,
//       awayScore: 1,
//       expected: { result: Result.win },
//     },
//     {
//       scenario: 'Fora marca - Não, Atual 2x0',
//       details: 'Fora: Não',
//       homeScore: 2,
//       awayScore: 0,
//       expected: { result: Result.win },
//     },
//   ];
//   runTests('analyzeEquipeMarca', equipeMarcaTests, analyzeEquipeMarca);

//   // 3. HANDICAP EUROPEU
//   const handicapEuropeuTests: TestCase[] = [
//     {
//       scenario: 'Casa -1, Atual 2x1 (2-1=1 vs 1+1=2, Fora vence)',
//       details: '-1',
//       homeScore: 2,
//       awayScore: 1,
//       expected: { result: Result.lose },
//     },
//     {
//       scenario: 'Casa -1, Atual 2x0 (2-1=1 vs 0+1=1, Empate)',
//       details: '-1',
//       homeScore: 2,
//       awayScore: 0,
//       expected: { result: Result.lose },
//     },
//     {
//       scenario: 'Casa -1, Atual 3x1 (3-1=2 vs 1+1=2, Casa vence)',
//       details: '-1',
//       homeScore: 3,
//       awayScore: 1,
//       expected: { result: Result.win },
//     },
//     {
//       scenario: 'Casa +2, Atual 1x2 (1+2=3 vs 2-2=0, Casa vence)',
//       details: '+2',
//       homeScore: 1,
//       awayScore: 2,
//       expected: { result: Result.win },
//     },
//     {
//       scenario: 'Casa -2, Atual 0x1 (0-2=-2 vs 1+2=3, Fora vence)',
//       details: '-2',
//       homeScore: 0,
//       awayScore: 1,
//       expected: { result: Result.lose },
//     },
//   ];
//   runTests(
//     'analyzeHandicapEuropeu',
//     handicapEuropeuTests,
//     analyzeHandicapEuropeu,
//   );

//   // 4. HANDICAP ASIÁTICO
//   const handicapAsiaticTests: TestCase[] = [
//     {
//       scenario: 'Casa -0.5, Atual 1x0 (Casa vence)',
//       details: '-0.5',
//       homeScore: 1,
//       awayScore: 0,
//       expected: { result: Result.win },
//     },
//     {
//       scenario: 'Casa -0.5, Atual 0x1 (Fora vence)',
//       details: '-0.5',
//       homeScore: 0,
//       awayScore: 1,
//       expected: { result: Result.lose },
//     },
//     {
//       scenario: 'Casa -1.5, Atual 2x1 (Casa vence)',
//       details: '-1.5',
//       homeScore: 2,
//       awayScore: 1,
//       expected: { result: Result.win },
//     },
//     {
//       scenario: 'Casa +1.0, Atual 1x1 (Empate, devolve aposta)',
//       details: '+1.0',
//       homeScore: 1,
//       awayScore: 1,
//       expected: { result: Result.void },
//     },
//     {
//       scenario: 'Casa -2.0, Atual 0x0 (Empate, perde)',
//       details: '-2.0',
//       homeScore: 0,
//       awayScore: 0,
//       expected: { result: Result.lose },
//     },
//   ];
//   runTests(
//     'analyzeHandicapAsiatico',
//     handicapAsiaticTests,
//     analyzeHandicapAsiatico,
//   );

//   // 5. HANDICAP POR TEMPO
//   const handicapPorTempoTests: TestCase[] = [
//     {
//       scenario: 'Casa -0.5 1º Tempo, HT 1x0',
//       details: 'Casa -0.5 1º Tempo',
//       homeScore: 1,
//       awayScore: 0,
//       homeScoreHT: 1,
//       awayScoreHT: 0,
//       expected: { result: Result.win },
//     },
//     {
//       scenario: 'Casa -0.5 1º Tempo, HT 0x0',
//       details: 'Casa -0.5 1º Tempo',
//       homeScore: 0,
//       awayScore: 0,
//       homeScoreHT: 0,
//       awayScoreHT: 0,
//       expected: { result: Result.lose },
//     },
//     {
//       scenario: 'Fora +0.5 2º Tempo, HT 0x1',
//       details: 'Fora +0.5 2º Tempo',
//       homeScore: 0,
//       awayScore: 1,
//       homeScoreHT: 0,
//       awayScoreHT: 1,
//       expected: { result: Result.win },
//     },
//   ];
//   runTests(
//     'analyzeHandicapPorTempo',
//     handicapPorTempoTests,
//     analyzeHandicapPorTempo,
//   );

//   // 6. NÚMERO PAR/ÍMPAR DE GOLS
//   const numeroParImparTests: TestCase[] = [
//     {
//       scenario: 'Esperado Par, Atual 2x0 (2 gols)',
//       details: 'Par',
//       homeScore: 2,
//       awayScore: 0,
//       expected: { result: Result.win },
//     },
//     {
//       scenario: 'Esperado Par, Atual 1x1 (2 gols)',
//       details: 'Par',
//       homeScore: 1,
//       awayScore: 1,
//       expected: { result: Result.win },
//     },
//     {
//       scenario: 'Esperado Par, Atual 1x0 (1 gol)',
//       details: 'Par',
//       homeScore: 1,
//       awayScore: 0,
//       expected: { result: Result.lose },
//     },
//     {
//       scenario: 'Esperado Ímpar, Atual 2x1 (3 gols)',
//       details: 'Ímpar',
//       homeScore: 2,
//       awayScore: 1,
//       expected: { result: Result.win },
//     },
//     {
//       scenario: 'Esperado Ímpar, Atual 0x0 (0 gols)',
//       details: 'Ímpar',
//       homeScore: 0,
//       awayScore: 0,
//       expected: { result: Result.lose },
//     },
//   ];
//   runTests('analyzeNumeroParImpar', numeroParImparTests, analyzeParOuImpar);

//   // 7. VENCE SEM SOFRER GOL
//   const venceSemSofrerGolTests: TestCase[] = [
//     {
//       scenario: 'Vence sem sofrer - Sim, Atual 2x0',
//       details: 'Sim',
//       homeScore: 2,
//       awayScore: 0,
//       expected: { result: Result.win },
//     },
//     {
//       scenario: 'Vence sem sofrer - Sim, Atual 0x2',
//       details: 'Sim',
//       homeScore: 0,
//       awayScore: 2,
//       expected: { result: Result.win },
//     },
//     {
//       scenario: 'Vence sem sofrer - Sim, Atual 1x1 (empate)',
//       details: 'Sim',
//       homeScore: 1,
//       awayScore: 1,
//       expected: { result: Result.lose },
//     },
//     {
//       scenario: 'Vence sem sofrer - Sim, Atual 2x1 (tomou gol)',
//       details: 'Sim',
//       homeScore: 2,
//       awayScore: 1,
//       expected: { result: Result.lose },
//     },
//     {
//       scenario: 'Vence sem sofrer - Não, Atual 1x1',
//       details: 'Não',
//       homeScore: 1,
//       awayScore: 1,
//       expected: { result: Result.win },
//     },
//     {
//       scenario: 'Vence sem sofrer - Não, Atual 2x0',
//       details: 'Não',
//       homeScore: 2,
//       awayScore: 0,
//       expected: { result: Result.lose },
//     },
//   ];
//   runTests(
//     'analyzeVenceSemSofrerGol',
//     venceSemSofrerGolTests,
//     analyzeVenceSemSofrerGol,
//   );

//   console.log('\n✨ Todos os testes foram concluídos!\n');
// }

// run();
