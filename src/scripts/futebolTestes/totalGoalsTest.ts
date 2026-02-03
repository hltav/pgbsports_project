import { Result } from '@prisma/client';
import { analyzeTotalGols } from './../../shared/results/analysis';

function run() {
  const tests = [
    // 🟦 OVER - ACERTOU (TOTAL > THRESHOLD)

    {
      scenario: 'Over 2.5: 2x1 (3 gols > 2.5) → WIN (early)',
      eventDetails: 'Over 2.5',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Over 1.5: 1x1 (2 gols > 1.5) → WIN (early)',
      eventDetails: 'Over 1.5',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Over 0.5: 1x0 (1 gol > 0.5) → WIN (early)',
      eventDetails: 'Over 0.5',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Over 3: 3x1 (4 gols > 3) → WIN (early)',
      eventDetails: 'Over 3',
      homeScore: 3,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // ============================================================
    // 🟥 OVER - ERROU (TOTAL ≤ THRESHOLD)
    // ============================================================
    {
      scenario: 'Over 2.5: 2x0 (2 gols ≤ 2.5) → LOSE',
      eventDetails: 'Over 2.5',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Over 3: 1x1 (2 gols ≤ 3) → LOSE',
      eventDetails: 'Over 3',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Over 2.5: 0x0 (0 gols ≤ 2.5) → LOSE',
      eventDetails: 'Over 2.5',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Over 1.5: 1x0 (1 gol ≤ 1.5) → LOSE',
      eventDetails: 'Over 1.5',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ============================================================
    // 🟦 UNDER - ACERTOU (TOTAL < THRESHOLD)
    // ============================================================
    {
      scenario: 'Under 2.5: 1x0 (1 gol < 2.5) → WIN',
      eventDetails: 'Under 2.5',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Under 3: 1x1 (2 gols < 3) → WIN',
      eventDetails: 'Under 3',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Under 1.5: 0x0 (0 gols < 1.5) → WIN',
      eventDetails: 'Under 1.5',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Under 5: 2x1 (3 gols < 5) → WIN',
      eventDetails: 'Under 5',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ============================================================
    // 🟥 UNDER - ERROU (TOTAL ≥ THRESHOLD) - EARLY
    // ============================================================
    {
      scenario: 'Under 2.5: 2x1 (3 gols ≥ 2.5) → LOSE (early)',
      eventDetails: 'Under 2.5',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Under 2: 1x1 (2 gols ≥ 2) → LOSE (early)',
      eventDetails: 'Under 2',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Under 3: 2x2 (4 gols ≥ 3) → LOSE (early)',
      eventDetails: 'Under 3',
      homeScore: 2,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Under 1: 1x0 (1 gol ≥ 1) → LOSE (early)',
      eventDetails: 'Under 1',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // ============================================================
    // 🔤 VARIAÇÕES COM "MAIS" E "MENOS"
    // ============================================================
    {
      scenario: 'Mais 2.5: 2x1 (3 gols > 2.5) → WIN',
      eventDetails: 'Mais 2.5',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Menos 2.5: 1x0 (1 gol < 2.5) → WIN',
      eventDetails: 'Menos 2.5',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'mais 3.5: 4x0 (4 gols > 3.5) → WIN',
      eventDetails: 'mais 3.5',
      homeScore: 4,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'menos 1.5: 1x0 (1 gol < 1.5) → WIN',
      eventDetails: 'menos 1.5',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ============================================================
    // 🔤 VARIAÇÕES COM INGLÊS
    // ============================================================
    {
      scenario: 'Over 2.5 (inglês): 2x1 → WIN',
      eventDetails: 'Over 2.5',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Under 2.5 (inglês): 1x0 → WIN',
      eventDetails: 'Under 2.5',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'OVER 2.5 (maiúsculo): 2x1 → WIN',
      eventDetails: 'OVER 2.5',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'UNDER 2.5 (maiúsculo): 1x0 → WIN',
      eventDetails: 'UNDER 2.5',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ============================================================
    // 🔤 VARIAÇÕES COM ESPAÇOS
    // ============================================================
    {
      scenario: '  Over 2.5  (com espaços): 2x1 → WIN',
      eventDetails: '  Over 2.5  ',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: '  Under 2.5  (com espaços): 1x0 → WIN',
      eventDetails: '  Under 2.5  ',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ============================================================
    // 🔢 NÚMEROS DIFERENTES
    // ============================================================
    {
      scenario: 'Over 0: 0x0 (0 gols > 0?) → LOSE',
      eventDetails: 'Over 0',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Over 0: 1x0 (1 gol > 0) → WIN',
      eventDetails: 'Over 0',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Under 0.5: 0x0 (0 gols < 0.5) → WIN',
      eventDetails: 'Under 0.5',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ============================================================
    // 🎯 CASOS EXTREMOS - MUITOS GOLS
    // ============================================================
    {
      scenario: 'Over 5: 5x3 (8 gols > 5) → WIN (early)',
      eventDetails: 'Over 5',
      homeScore: 5,
      awayScore: 3,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Over 10: 5x3 (8 gols ≤ 10) → LOSE',
      eventDetails: 'Over 10',
      homeScore: 5,
      awayScore: 3,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Under 10: 5x3 (8 gols < 10) → WIN',
      eventDetails: 'Under 10',
      homeScore: 5,
      awayScore: 3,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Under 7: 5x3 (8 gols ≥ 7) → LOSE (early)',
      eventDetails: 'Under 7',
      homeScore: 5,
      awayScore: 3,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test) => {
    const result = analyzeTotalGols(
      test.eventDetails,
      test.homeScore,
      test.awayScore,
    );

    const testPassed =
      result.result === test.expected.result &&
      result.shouldUpdate === test.expected.shouldUpdate &&
      result.isFinalizableEarly === test.expected.isFinalizableEarly;

    if (testPassed) {
      passed++;
    } else {
      failed++;
    }

    console.log(
      `${testPassed ? '✅' : '❌'} ${test.scenario} → ${Result[result.result]} (early: ${result.isFinalizableEarly ?? false})`,
    );

    if (!testPassed) {
      console.log(
        `   Esperado: ${Result[test.expected.result]} (early: ${test.expected.isFinalizableEarly})`,
      );
      console.log(
        `   Recebido: ${Result[result.result]} (early: ${result.isFinalizableEarly ?? false})`,
      );
    }
  });

  console.log(`\n📊 ${passed}/${tests.length} testes passaram`);
  if (failed > 0) {
    console.log(`❌ ${failed} teste(s) falharam`);
  }
}

run();
