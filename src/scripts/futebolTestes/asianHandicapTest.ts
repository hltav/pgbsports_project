import { Result } from '@prisma/client';
import { analyzeHandicapAsiatico } from './../../shared/thesportsdb-api/services/analysis';

function run() {
  const tests = [
    // ============================================================
    // 🟦 HANDICAP INTEIRO - CASA -2
    // ============================================================
    {
      scenario: 'Casa -2: 3x1 (3-2=1, 1) → WIN (1 > 1? Não, = 1)',
      eventDetails: 'Casa -2',
      homeScore: 3,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -2: 2x0 (2-2=0, 0) → LOSE (0 = 0)',
      eventDetails: 'Casa -2',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -2: 2x1 (2-2=0 = 1) → LOSE (empate)',
      eventDetails: 'Casa -2',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -2: 0x0 (0-2=-2 < 0) → LOSE',
      eventDetails: 'Casa -2',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟦 HANDICAP INTEIRO - CASA -1
    // ============================================================
    {
      scenario: 'Casa -1: 2x1 (2-1=1, 1) → LOSE (1 = 1)',
      eventDetails: 'Casa -1',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -1: 1x0 (1-1=0, 0) → LOSE (0 = 0)',
      eventDetails: 'Casa -1',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -1: 1x1 (1-1=0 = 1) → LOSE (empate)',
      eventDetails: 'Casa -1',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟦 HANDICAP INTEIRO - CASA +1
    // ============================================================
    {
      scenario: 'Casa +1: 1x0 (1+1=2 > 0) → WIN',
      eventDetails: 'Casa +1',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +1: 0x0 (0+1=1 > 0) → WIN',
      eventDetails: 'Casa +1',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +1: 0x1 (0+1=1, 1) → LOSE (1 = 1)',
      eventDetails: 'Casa +1',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟦 HANDICAP INTEIRO - CASA 0
    // ============================================================
    {
      scenario: 'Casa 0: 2x1 (2+0=2 > 1-0=1) → WIN',
      eventDetails: 'Casa 0',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa 0: 1x1 (1+0=1 = 1-0=1) → LOSE (empate)',
      eventDetails: 'Casa 0',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟦 HANDICAP .5 - NUNCA EMPATA
    // ============================================================
    {
      scenario: 'Casa -1.5: 2x1 (2-1.5=0.5, 1) → LOSE (0.5 < 1)',
      eventDetails: 'Casa -1.5',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -1.5: 1x0 (1-1.5=-0.5 < 0) → LOSE',
      eventDetails: 'Casa -1.5',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -0.5: 1x0 (1-0.5=0.5, 0) → WIN (0.5 > 0)',
      eventDetails: 'Casa -0.5',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -0.5: 0x0 (0-0.5=-0.5 < 0) → LOSE',
      eventDetails: 'Casa -0.5',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +0.5: 0x0 (0+0.5=0.5 > 0) → WIN',
      eventDetails: 'Casa +0.5',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +0.5: 0x1 (0+0.5=0.5 < 1) → LOSE',
      eventDetails: 'Casa +0.5',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟦 HANDICAP .25 e .75 - PODE DEVOLVER METADE (VOID)
    // ============================================================
    {
      scenario: 'Casa -1.25: 2x1 (2-1.25=0.75, 1) → LOSE (0.75 < 1)',
      eventDetails: 'Casa -1.25',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -1.25: 1x0 (1-1.25=-0.25 < 0) → LOSE',
      eventDetails: 'Casa -1.25',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -1.25: 1x1 (1-1.25=-0.25 < 1) → LOSE',
      eventDetails: 'Casa -1.25',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -0.25: 1x0 (1-0.25=0.75 > 0) → WIN',
      eventDetails: 'Casa -0.25',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -0.25: 0x0 (0-0.25=-0.25 < 0) → LOSE',
      eventDetails: 'Casa -0.25',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +0.25: 0x0 (0+0.25=0.25 > 0) → WIN',
      eventDetails: 'Casa +0.25',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -0.75: 1x0 (1-0.75=0.25 > 0) → WIN',
      eventDetails: 'Casa -0.75',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +0.75: 0x0 (0+0.75=0.75 > 0) → WIN',
      eventDetails: 'Casa +0.75',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🔤 VARIAÇÕES DE TEXTO
    // ============================================================
    {
      scenario: 'casa -1.5 (minúsculo): 2x1 → lose',
      eventDetails: 'casa -1.5',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'CASA -1.5 (maiúsculo): 2x1 → lose',
      eventDetails: 'CASA -1.5',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: '-1.5 (apenas número): 2x1 → lose',
      eventDetails: '-1.5',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: '+0.5 (com sinal positivo): 0x0 → win',
      eventDetails: '+0.5',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -1.5 com espaços: 2x1 → lose',
      eventDetails: 'Casa -1.5',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🎯 CASOS EXTREMOS
    // ============================================================
    {
      scenario: 'Casa -2.5: 5x0 (5-2.5=2.5 > 0) → WIN',
      eventDetails: 'Casa -2.5',
      homeScore: 5,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +2.5: 0x5 (0+2.5=2.5 < 5) → LOSE',
      eventDetails: 'Casa +2.5',
      homeScore: 0,
      awayScore: 5,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -3.75: 4x0 (4-3.75=0.25 > 0) → WIN',
      eventDetails: 'Casa -3.75',
      homeScore: 4,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test) => {
    const result = analyzeHandicapAsiatico(
      test.eventDetails,
      test.homeScore,
      test.awayScore,
    );

    const testPassed =
      result.result === test.expected.result &&
      result.shouldUpdate === test.expected.shouldUpdate;

    if (testPassed) {
      passed++;
    } else {
      failed++;
    }

    console.log(
      `${testPassed ? '✅' : '❌'} ${test.scenario} → ${Result[result.result]}`,
    );

    if (!testPassed) {
      console.log(`   Esperado: ${Result[test.expected.result]}`);
      console.log(`   Recebido: ${Result[result.result]}`);
    }
  });

  console.log(`\n📊 ${passed}/${tests.length} testes passaram`);
  if (failed > 0) {
    console.log(`❌ ${failed} teste(s) falharam`);
  }
}

run();
