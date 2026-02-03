import { Result } from '@prisma/client';
import { analyzePlacarExatoImproved } from './../../shared/results/analysis';

function run() {
  const tests = [
    // =======================
    //     JOGO FINALIZADO
    // =======================

    {
      scenario: 'FT: 2x0 esperado e jogo terminou 2x0 → WIN',
      eventDetails: '2x0',
      homeScore: 2,
      awayScore: 0,
      isMatchFinished: true,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true, // o código marca vitória como early também
      },
    },
    {
      scenario: 'FT: 2x1 esperado e terminou 3x1 → LOSE',
      eventDetails: '2x1',
      homeScore: 3,
      awayScore: 1,
      isMatchFinished: true,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true, // porque já ultrapassou o placar esperado
      },
    },

    {
      scenario: 'FT: 1x1 esperado e terminou 1x0 → LOSE',
      eventDetails: '1x1',
      homeScore: 1,
      awayScore: 0,
      isMatchFinished: true,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // =======================
    //      EARLY FINISH
    // =======================

    {
      scenario: 'EARLY LOSE: esperado 1x0 mas já está 2x0 → impossível vencer',
      eventDetails: '1x0',
      homeScore: 2,
      awayScore: 0,
      isMatchFinished: false,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'EARLY LOSE: esperado 2x1 mas já está 0x3 → impossível',
      eventDetails: '2x1',
      homeScore: 0,
      awayScore: 3,
      isMatchFinished: false,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    {
      scenario:
        'EARLY WIN: esperado 1x1 e jogo já está exatamente 1x1 → victory locked',
      eventDetails: '1x1',
      homeScore: 1,
      awayScore: 1,
      isMatchFinished: false,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // =======================
    //  APOSTA AINDA VIVA
    // =======================

    {
      scenario: 'Aposta viva: esperado 2x1 e jogo está 1x1 → ainda possível',
      eventDetails: '2x1',
      homeScore: 1,
      awayScore: 1,
      isMatchFinished: false,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // =======================
    //   FORMATO INVÁLIDO
    // =======================

    {
      scenario: "Formato inválido: 'abc' → VOID",
      eventDetails: 'abc',
      homeScore: 0,
      awayScore: 0,
      isMatchFinished: true,
      expected: {
        result: Result.void,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    {
      scenario: "Formato inválido: '2x' → VOID",
      eventDetails: '2x',
      homeScore: 0,
      awayScore: 0,
      isMatchFinished: true,
      expected: {
        result: Result.void,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test) => {
    const result = analyzePlacarExatoImproved(
      test.eventDetails,
      test.homeScore,
      test.awayScore,
    );

    const isFinalizableEarly = result.isFinalizableEarly ?? false;

    const testPassed =
      result.result === test.expected.result &&
      result.shouldUpdate === test.expected.shouldUpdate &&
      isFinalizableEarly === test.expected.isFinalizableEarly;

    if (testPassed) passed++;
    else failed++;

    console.log(
      `${testPassed ? '✅' : '❌'} ${test.scenario} → ${
        Result[result.result]
      } (early: ${isFinalizableEarly})`,
    );

    if (!testPassed) {
      console.log(
        `   Esperado: ${Result[test.expected.result]} (early: ${test.expected.isFinalizableEarly})`,
      );
      console.log(
        `   Recebido: ${Result[result.result]} (early: ${isFinalizableEarly})`,
      );
    }
  });

  console.log(`\n📊 ${passed}/${tests.length} testes passaram`);
  if (failed > 0) console.log(`❌ ${failed} teste(s) falharam`);
}

run();
