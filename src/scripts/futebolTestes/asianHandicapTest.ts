import { Result } from '@prisma/client';
import { analyzeHandicapAsiatico } from './../../shared/results/analysis';

function run() {
  const tests = [
    // ============================================================
    // 🟦 HANDICAP INTEIRO - CASA -2
    // ============================================================
    {
      scenario: 'Casa -2: 4x0 (4-2=2 > 0) → WIN',
      eventDetails: 'Casa -2',
      homeScore: 4,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -2: 3x1 (3-2=1, 1) → RETURNED (1 = 1)',
      eventDetails: 'Casa -2',
      homeScore: 3,
      awayScore: 1,
      expected: {
        result: Result.returned,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -2: 2x0 (2-2=0, 0) → RETURNED (0 = 0)',
      eventDetails: 'Casa -2',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.returned,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -2: 2x1 (2-2=0 < 1) → LOSE',
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
      scenario: 'Casa -1: 3x1 (3-1=2 > 1) → WIN',
      eventDetails: 'Casa -1',
      homeScore: 3,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -1: 2x1 (2-1=1, 1) → RETURNED (1 = 1)',
      eventDetails: 'Casa -1',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.returned,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -1: 1x0 (1-1=0, 0) → RETURNED (0 = 0)',
      eventDetails: 'Casa -1',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.returned,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -1: 1x1 (1-1=0 < 1) → LOSE',
      eventDetails: 'Casa -1',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -1: 0x1 (0-1=-1 < 1) → LOSE',
      eventDetails: 'Casa -1',
      homeScore: 0,
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
      scenario: 'Casa +1: 2x0 (2+1=3 > 0) → WIN',
      eventDetails: 'Casa +1',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
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
      scenario: 'Casa +1: 0x1 (0+1=1, 1) → RETURNED (1 = 1)',
      eventDetails: 'Casa +1',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.returned,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +1: 0x2 (0+1=1 < 2) → LOSE',
      eventDetails: 'Casa +1',
      homeScore: 0,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟦 HANDICAP INTEIRO - CASA 0
    // ============================================================
    {
      scenario: 'Casa 0: 2x1 (2+0=2 > 1) → WIN',
      eventDetails: 'Casa 0',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa 0: 1x0 (1+0=1 > 0) → WIN',
      eventDetails: 'Casa 0',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa 0: 1x1 (1+0=1 = 1) → RETURNED',
      eventDetails: 'Casa 0',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.returned,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa 0: 0x1 (0+0=0 < 1) → LOSE',
      eventDetails: 'Casa 0',
      homeScore: 0,
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
      scenario: 'Casa -1.5: 3x0 (3-1.5=1.5 > 0) → WIN',
      eventDetails: 'Casa -1.5',
      homeScore: 3,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
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
      scenario: 'Casa +0.5: 1x0 (1+0.5=1.5 > 0) → WIN',
      eventDetails: 'Casa +0.5',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
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
    // 🟦 HANDICAP .25 - DIVIDE EM 0 e 0.5
    // ============================================================
    {
      scenario: 'Casa -0.25: 1x0 (split: -0 WIN, -0.5 WIN) → WIN',
      eventDetails: 'Casa -0.25',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -0.25: 0x0 (split: -0 RETURNED, -0.5 LOSE) → HALF_LOSE',
      eventDetails: 'Casa -0.25',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.half_lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -0.25: 0x1 (split: -0 LOSE, -0.5 LOSE) → LOSE',
      eventDetails: 'Casa -0.25',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +0.25: 1x0 (split: +0 WIN, +0.5 WIN) → WIN',
      eventDetails: 'Casa +0.25',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +0.25: 0x0 (split: +0 RETURNED, +0.5 WIN) → HALF_WIN',
      eventDetails: 'Casa +0.25',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.half_win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +0.25: 0x1 (split: +0 LOSE, +0.5 LOSE) → LOSE',
      eventDetails: 'Casa +0.25',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟦 HANDICAP .75 - DIVIDE EM 0.5 e 1
    // ============================================================
    {
      scenario: 'Casa -0.75: 2x0 (split: -0.5 WIN, -1 WIN) → WIN',
      eventDetails: 'Casa -0.75',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -0.75: 1x0 (split: -0.5 WIN, -1 RETURNED) → HALF_WIN',
      eventDetails: 'Casa -0.75',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.half_win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -0.75: 0x0 (split: -0.5 LOSE, -1 LOSE) → LOSE',
      eventDetails: 'Casa -0.75',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +0.75: 0x0 (split: +0.5 WIN, +1 WIN) → WIN',
      eventDetails: 'Casa +0.75',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +0.75: 0x1 (split: +0.5 LOSE, +1 RETURNED) → HALF_LOSE',
      eventDetails: 'Casa +0.75',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.half_lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +0.75: 0x2 (split: +0.5 LOSE, +1 LOSE) → LOSE',
      eventDetails: 'Casa +0.75',
      homeScore: 0,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟦 HANDICAP -1.25 - DIVIDE EM -1 e -1.5
    // ============================================================
    {
      scenario: 'Casa -1.25: 3x0 (split: -1 WIN, -1.5 WIN) → WIN',
      eventDetails: 'Casa -1.25',
      homeScore: 3,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -1.25: 2x1 (split: -1 RETURNED, -1.5 LOSE) → HALF_LOSE',
      eventDetails: 'Casa -1.25',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.half_lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -1.25: 1x0 (split: -1 RETURNED, -1.5 LOSE) → HALF_LOSE',
      eventDetails: 'Casa -1.25',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.half_lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -1.25: 1x1 (split: -1 LOSE, -1.5 LOSE) → LOSE',
      eventDetails: 'Casa -1.25',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟦 HANDICAP -1.75 - DIVIDE EM -1.5 e -2
    // ============================================================
    {
      scenario: 'Casa -1.75: 3x0 (split: -1.5 WIN, -2 WIN) → WIN',
      eventDetails: 'Casa -1.75',
      homeScore: 3,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -1.75: 2x0 (split: -1.5 WIN, -2 RETURNED) → HALF_WIN',
      eventDetails: 'Casa -1.75',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.half_win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -1.75: 2x1 (split: -1.5 LOSE, -2 LOSE) → LOSE',
      eventDetails: 'Casa -1.75',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
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
      scenario: 'Casa -2.5: 3x1 (3-2.5=0.5 < 1) → LOSE',
      eventDetails: 'Casa -2.5',
      homeScore: 3,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +2.5: 0x0 (0+2.5=2.5 > 0) → WIN',
      eventDetails: 'Casa +2.5',
      homeScore: 0,
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
      scenario: 'Casa -3.75: 5x0 (split: -3.5 WIN, -4 WIN) → WIN',
      eventDetails: 'Casa -3.75',
      homeScore: 5,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -3.75: 4x0 (split: -3.5 WIN, -4 RETURNED) → HALF_WIN',
      eventDetails: 'Casa -3.75',
      homeScore: 4,
      awayScore: 0,
      expected: {
        result: Result.half_win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -3.75: 3x0 (split: -3.5 LOSE, -4 LOSE) → LOSE',
      eventDetails: 'Casa -3.75',
      homeScore: 3,
      awayScore: 0,
      expected: {
        result: Result.lose,
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
