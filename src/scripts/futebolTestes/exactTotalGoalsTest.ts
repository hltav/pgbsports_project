import { Result } from '@prisma/client';
import { analyzeTotalExatoGols } from './../../shared/results/analysis';

function run() {
  const tests = [
    // ============================================================
    // ✅ TOTAL EXATO - ACERTOU
    // ============================================================
    {
      scenario: 'Total 0: 0x0 (0 gols - acertou)',
      eventDetails: 'Total 0',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Total 1: 1x0 (1 gol - acertou)',
      eventDetails: 'Total 1',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Total 2: 1x1 (2 gols - acertou)',
      eventDetails: 'Total 2',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Total 3: 2x1 (3 gols - acertou)',
      eventDetails: 'Total 3',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Total 5: 3x2 (5 gols - acertou)',
      eventDetails: 'Total 5',
      homeScore: 3,
      awayScore: 2,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // ============================================================
    // 🟥 TOTAL EXATO - ERROU (MENOS GOLS)
    // ============================================================
    {
      scenario: 'Total 3: 1x0 (1 gol - menos do que esperado)',
      eventDetails: 'Total 3',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false, // Pode chegar a 3
      },
    },
    {
      scenario: 'Total 5: 2x1 (3 gols - menos do que esperado)',
      eventDetails: 'Total 5',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Total 2: 1x0 (1 gol - menos do que esperado)',
      eventDetails: 'Total 2',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ============================================================
    // 🟥 TOTAL EXATO - ERROU (MAIS GOLS)
    // ============================================================
    {
      scenario: 'Total 2: 3x0 (3 gols - mais do que esperado)',
      eventDetails: 'Total 2',
      homeScore: 3,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true, // Passou de 2, não volta
      },
    },
    {
      scenario: 'Total 3: 2x2 (4 gols - mais do que esperado)',
      eventDetails: 'Total 3',
      homeScore: 2,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Total 1: 1x1 (2 gols - mais do que esperado)',
      eventDetails: 'Total 1',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // ============================================================
    // 🟦 TOTAL 6+ - ACERTOU (6 OU MAIS)
    // ============================================================
    {
      scenario: 'Total 6+: 3x3 (6 gols - acertou)',
      eventDetails: 'Total 6+',
      homeScore: 3,
      awayScore: 3,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Total 6+: 4x3 (7 gols - acertou)',
      eventDetails: 'Total 6+',
      homeScore: 4,
      awayScore: 3,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Total 6+: 5x5 (10 gols - acertou)',
      eventDetails: 'Total 6+',
      homeScore: 5,
      awayScore: 5,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // ============================================================
    // 🟥 TOTAL 6+ - ERROU (MENOS DE 6)
    // ============================================================
    {
      scenario: 'Total 6+: 2x2 (4 gols - menos de 6)',
      eventDetails: 'Total 6+',
      homeScore: 2,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false, // Pode chegar a 6
      },
    },
    {
      scenario: 'Total 6+: 3x2 (5 gols - menos de 6)',
      eventDetails: 'Total 6+',
      homeScore: 3,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Total 6+: 0x0 (0 gols - menos de 6)',
      eventDetails: 'Total 6+',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ============================================================
    // 🔤 VARIAÇÕES DE TEXTO
    // ============================================================
    {
      scenario: 'total 3 (minúsculo): 2x1',
      eventDetails: 'total 3',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'TOTAL 3 (maiúsculo): 2x1',
      eventDetails: 'TOTAL 3',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'total 6+ (minúsculo): 3x3',
      eventDetails: 'total 6+',
      homeScore: 3,
      awayScore: 3,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'TOTAL 6+ (maiúsculo): 3x3',
      eventDetails: 'TOTAL 6+',
      homeScore: 3,
      awayScore: 3,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: '  Total 2  (com espaços): 1x1',
      eventDetails: '  Total 2  ',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // ============================================================
    // 🔢 APENAS O NÚMERO
    // ============================================================
    {
      scenario: '3 (apenas número): 2x1',
      eventDetails: '3',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: '6+ (apenas 6+): 3x3',
      eventDetails: '6+',
      homeScore: 3,
      awayScore: 3,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // ============================================================
    // 🎯 EDGE CASES - MUITOS GOLS
    // ============================================================
    {
      scenario: 'Total 10: 5x5 (10 gols - acertou)',
      eventDetails: 'Total 10',
      homeScore: 5,
      awayScore: 5,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Total 10: 3x3 (6 gols - menos)',
      eventDetails: 'Total 10',
      homeScore: 3,
      awayScore: 3,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Total 4: 4x2 (6 gols - mais, early lose)',
      eventDetails: 'Total 4',
      homeScore: 4,
      awayScore: 2,
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
    const result = analyzeTotalExatoGols(
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
