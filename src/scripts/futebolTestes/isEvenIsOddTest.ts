import { Result } from '@prisma/client';
import { analyzeNumeroParImpar } from './../../shared/results/analysis';

function run() {
  const tests = [
    // ============================================================
    // 🟦 PAR - TOTAL DE GOLS PAR
    // ============================================================
    {
      scenario: 'Par: 0x0 (0 gols - par)',
      eventDetails: 'Par',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Par: 1x1 (2 gols - par)',
      eventDetails: 'Par',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Par: 2x0 (2 gols - par)',
      eventDetails: 'Par',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Par: 2x2 (4 gols - par)',
      eventDetails: 'Par',
      homeScore: 2,
      awayScore: 2,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Par: 3x3 (6 gols - par)',
      eventDetails: 'Par',
      homeScore: 3,
      awayScore: 3,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟥 PAR - TOTAL DE GOLS ÍMPAR
    // ============================================================
    {
      scenario: 'Par: 1x0 (1 gol - ímpar)',
      eventDetails: 'Par',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Par: 0x1 (1 gol - ímpar)',
      eventDetails: 'Par',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Par: 2x1 (3 gols - ímpar)',
      eventDetails: 'Par',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Par: 3x2 (5 gols - ímpar)',
      eventDetails: 'Par',
      homeScore: 3,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟦 ÍMPAR - TOTAL DE GOLS ÍMPAR
    // ============================================================
    {
      scenario: 'Ímpar: 1x0 (1 gol - ímpar)',
      eventDetails: 'Ímpar',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Ímpar: 0x1 (1 gol - ímpar)',
      eventDetails: 'Ímpar',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Ímpar: 2x1 (3 gols - ímpar)',
      eventDetails: 'Ímpar',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Ímpar: 3x2 (5 gols - ímpar)',
      eventDetails: 'Ímpar',
      homeScore: 3,
      awayScore: 2,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Ímpar: 4x3 (7 gols - ímpar)',
      eventDetails: 'Ímpar',
      homeScore: 4,
      awayScore: 3,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟥 ÍMPAR - TOTAL DE GOLS PAR
    // ============================================================
    {
      scenario: 'Ímpar: 0x0 (0 gols - par)',
      eventDetails: 'Ímpar',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Ímpar: 1x1 (2 gols - par)',
      eventDetails: 'Ímpar',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Ímpar: 2x0 (2 gols - par)',
      eventDetails: 'Ímpar',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Ímpar: 2x2 (4 gols - par)',
      eventDetails: 'Ímpar',
      homeScore: 2,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🔤 VARIAÇÕES DE TEXTO
    // ============================================================
    {
      scenario: 'par (minúsculo): 2x0',
      eventDetails: 'par',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'PAR (maiúsculo): 2x0',
      eventDetails: 'PAR',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'ímpar (minúsculo): 1x0',
      eventDetails: 'ímpar',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'ÍMPAR (maiúsculo): 1x0',
      eventDetails: 'ÍMPAR',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'impar (sem til): 1x0',
      eventDetails: 'impar',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.lose, // Sem "ímpar" com til, não vai dar match
        shouldUpdate: true,
      },
    },
    {
      scenario: '  Par  (com espaços): 2x0',
      eventDetails: '  Par  ',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // ⚠️ CASOS INVÁLIDOS
    // ============================================================
    {
      scenario: 'Texto inválido: "invalido"',
      eventDetails: 'invalido',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.void,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Texto vazio: ""',
      eventDetails: '',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.void,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Ambíguo: "parímpar"',
      eventDetails: 'parímpar',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win, // Contém "par" primeiro
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🎯 EDGE CASES - MUITOS GOLS
    // ============================================================
    {
      scenario: 'Par: 10x0 (10 gols - par)',
      eventDetails: 'Par',
      homeScore: 10,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Ímpar: 5x6 (11 gols - ímpar)',
      eventDetails: 'Ímpar',
      homeScore: 5,
      awayScore: 6,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Par: 0x9 (9 gols - ímpar)',
      eventDetails: 'Par',
      homeScore: 0,
      awayScore: 9,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test) => {
    const result = analyzeNumeroParImpar(
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
