import { Result } from '@prisma/client';
import { analyzeResultadoFinal } from './../../shared/results/analysis';

function run() {
  const tests = [
    // ============================================================
    // ✅ CASA - VITÓRIA
    // ============================================================
    {
      scenario: 'Casa: 2x1 (casa vence)',
      eventDetails: 'Casa',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa: 3x0 (casa vence)',
      eventDetails: 'Casa',
      homeScore: 3,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // ❌ CASA - DERROTA/EMPATE
    // ============================================================
    {
      scenario: 'Casa: 1x2 (fora vence)',
      eventDetails: 'Casa',
      homeScore: 1,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa: 1x1 (empate)',
      eventDetails: 'Casa',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa: 0x3 (fora vence)',
      eventDetails: 'Casa',
      homeScore: 0,
      awayScore: 3,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // ✅ EMPATE - VITÓRIA
    // ============================================================
    {
      scenario: 'Empate: 1x1 (empate)',
      eventDetails: 'Empate',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Empate: 2x2 (empate)',
      eventDetails: 'Empate',
      homeScore: 2,
      awayScore: 2,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Empate: 0x0 (empate)',
      eventDetails: 'Empate',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // ❌ EMPATE - DERROTA
    // ============================================================
    {
      scenario: 'Empate: 2x1 (casa vence)',
      eventDetails: 'Empate',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Empate: 0x3 (fora vence)',
      eventDetails: 'Empate',
      homeScore: 0,
      awayScore: 3,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // ✅ FORA - VITÓRIA
    // ============================================================
    {
      scenario: 'Fora: 1x2 (fora vence)',
      eventDetails: 'Fora',
      homeScore: 1,
      awayScore: 2,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Fora: 0x3 (fora vence)',
      eventDetails: 'Fora',
      homeScore: 0,
      awayScore: 3,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // ❌ FORA - DERROTA/EMPATE
    // ============================================================
    {
      scenario: 'Fora: 2x1 (casa vence)',
      eventDetails: 'Fora',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Fora: 1x1 (empate)',
      eventDetails: 'Fora',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Fora: 3x0 (casa vence)',
      eventDetails: 'Fora',
      homeScore: 3,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🔢 VARIAÇÕES COM NÚMEROS (1/X/2)
    // ============================================================
    {
      scenario: '1: 2x0 (casa vence)',
      eventDetails: '1',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.lose, // "1" não contém "Casa", então lose
        shouldUpdate: true,
      },
    },
    {
      scenario: 'X: 2x2 (empate)',
      eventDetails: 'X',
      homeScore: 2,
      awayScore: 2,
      expected: {
        result: Result.lose, // "X" não contém "Empate", então lose
        shouldUpdate: true,
      },
    },
    {
      scenario: '2: 1x3 (fora vence)',
      eventDetails: '2',
      homeScore: 1,
      awayScore: 3,
      expected: {
        result: Result.lose, // "2" não contém "Fora", então lose
        shouldUpdate: true,
      },
    },

    // ============================================================
    // ⚠️ CASE SENSITIVE
    // ============================================================
    {
      scenario: 'casa (minúsculo): 2x1 (casa vence)',
      eventDetails: 'casa',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose, // "casa" não contém "Casa" (maiúsculo), então lose
        shouldUpdate: true,
      },
    },
    {
      scenario: 'CASA (maiúsculo): 2x1 (casa vence)',
      eventDetails: 'CASA',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose, // "CASA" não contém "Casa", então lose
        shouldUpdate: true,
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test) => {
    const result = analyzeResultadoFinal(
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
