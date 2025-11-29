import { Result } from '@prisma/client';
import { analyzeHandicapEuropeu } from './../../shared/thesportsdb-api/services/analysis';

function run() {
  const tests = [
    // ============================================================
    // 🏠 CASA -2 (CASA TEM DESVANTAGEM)
    // ============================================================
    {
      scenario: 'Casa -2: 3x1 (3-2=1 = 1) → LOSE (não é >)',
      eventDetails: 'Casa -2',
      homeScore: 3,
      awayScore: 1,
      expected: {
        result: Result.lose,
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

    // ============================================================
    // 🏠 CASA -1 (CASA TEM LEVE DESVANTAGEM)
    // ============================================================
    {
      scenario: 'Casa -1: 2x1 (2-1=1 = 1) → LOSE (não é >)',
      eventDetails: 'Casa -1',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
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
      scenario: 'Casa -1: 3x0 (3-1=2 > 0) → WIN',
      eventDetails: 'Casa -1',
      homeScore: 3,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -1: 1x2 (1-1=0 < 2) → LOSE',
      eventDetails: 'Casa -1',
      homeScore: 1,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🏠 CASA +1 (CASA TEM LEVE VANTAGEM)
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
      scenario: 'Casa +1: 1x2 (1+1=2 = 2) → LOSE (não é >, é =)',
      eventDetails: 'Casa +1',
      homeScore: 1,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +1: 2x1 (2+1=3 > 1) → WIN',
      eventDetails: 'Casa +1',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🏠 CASA +2 (CASA TEM GRANDE VANTAGEM)
    // ============================================================
    {
      scenario: 'Casa +2: 0x0 (0+2=2 > 0) → WIN',
      eventDetails: 'Casa +2',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +2: 1x2 (1+2=3 > 2) → WIN',
      eventDetails: 'Casa +2',
      homeScore: 1,
      awayScore: 2,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +2: 0x1 (0+2=2 > 1) → WIN',
      eventDetails: 'Casa +2',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +2: 1x5 (1+2=3 < 5) → LOSE',
      eventDetails: 'Casa +2',
      homeScore: 1,
      awayScore: 5,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🔤 VARIAÇÕES DE TEXTO
    // ============================================================
    {
      scenario: 'casa -1 (minúsculo): 2x1 → lose',
      eventDetails: 'casa -1',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'CASA -1 (maiúsculo): 2x1 → lose',
      eventDetails: 'CASA -1',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: '-1 (apenas número): 2x1 → lose',
      eventDetails: '-1',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: '+2 (com sinal positivo): 0x0',
      eventDetails: '+2',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: '  Casa -2  (com espaços): 3x1 → lose',
      eventDetails: '  Casa -2  ',
      homeScore: 3,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🎯 CASOS ESPECIAIS - EMPATE COM HANDICAP
    // ============================================================
    {
      scenario: 'Casa -1: 1x1 (1-1=0 = 1, empate) → LOSE',
      eventDetails: 'Casa -1',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +1: 1x2 (1+1=2 = 2, empate) → LOSE',
      eventDetails: 'Casa +1',
      homeScore: 1,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -2: 2x2 (2-2=0 = 2, empate) → LOSE',
      eventDetails: 'Casa -2',
      homeScore: 2,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🎯 CASOS EXTREMOS - GOLEADAS
    // ============================================================
    {
      scenario: 'Casa -2: 5x0 (5-2=3 > 0) → WIN',
      eventDetails: 'Casa -2',
      homeScore: 5,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -2: 0x5 (0-2=-2 < 5) → LOSE',
      eventDetails: 'Casa -2',
      homeScore: 0,
      awayScore: 5,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +2: 1x5 (1+2=3 < 5) → LOSE',
      eventDetails: 'Casa +2',
      homeScore: 1,
      awayScore: 5,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +2: 3x0 (3+2=5 > 0) → WIN',
      eventDetails: 'Casa +2',
      homeScore: 3,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🔢 HANDICAP MAIOR
    // ============================================================
    {
      scenario: 'Casa -3: 4x1 (4-3=1 = 1) → LOSE (não é >)',
      eventDetails: 'Casa -3',
      homeScore: 4,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa +3: 0x0 (0+3=3 > 0) → WIN',
      eventDetails: 'Casa +3',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa -3: 2x1 (2-3=-1 < 1) → LOSE',
      eventDetails: 'Casa -3',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test) => {
    const result = analyzeHandicapEuropeu(
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
