import { Result } from '@prisma/client';
import { analyzeGolNosDoisTempos } from './../../shared/results/analysis';

function run() {
  const tests = [
    // ============================================================
    // 🟦 SIM - HOUVE GOLS NOS DOIS TEMPOS
    // ============================================================
    {
      scenario: 'Sim: HT 1x0 → FT 2x1 (gols nos 2 tempos)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Sim: HT 0x1 → FT 1x2 (gols nos 2 tempos)',
      eventDetails: 'Sim',
      homeScoreHT: 0,
      awayScoreHT: 1,
      homeScoreFT: 1,
      awayScoreFT: 2,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Sim: HT 1x1 → FT 2x2 (gols nos 2 tempos)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 2,
      awayScoreFT: 2,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Sim: HT 2x0 → FT 3x2 (gols nos 2 tempos)',
      eventDetails: 'Sim',
      homeScoreHT: 2,
      awayScoreHT: 0,
      homeScoreFT: 3,
      awayScoreFT: 2,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟥 SIM - NÃO HOUVE GOLS EM UM DOS TEMPOS
    // ============================================================
    {
      scenario: 'Sim: HT 0x0 → FT 1x1 (sem gols no 1º tempo)',
      eventDetails: 'Sim',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 1,
      awayScoreFT: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Sim: HT 1x1 → FT 1x1 (sem gols no 2º tempo)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 1,
      awayScoreFT: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Sim: HT 0x0 → FT 0x0 (sem gols em nenhum tempo)',
      eventDetails: 'Sim',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 0,
      awayScoreFT: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Sim: HT 2x1 → FT 2x1 (sem gols no 2º tempo)',
      eventDetails: 'Sim',
      homeScoreHT: 2,
      awayScoreHT: 1,
      homeScoreFT: 2,
      awayScoreFT: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟦 NÃO - NÃO HOUVE GOLS NOS DOIS TEMPOS
    // ============================================================
    {
      scenario: 'Não: HT 0x0 → FT 1x0 (sem gols em ambos tempos)',
      eventDetails: 'Não',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 1,
      awayScoreFT: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Não: HT 1x1 → FT 1x1 (sem gols no 2º tempo)',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 1,
      awayScoreFT: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Não: HT 0x0 → FT 0x0 (sem gols em nenhum tempo)',
      eventDetails: 'Não',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 0,
      awayScoreFT: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟥 NÃO - HOUVE GOLS NOS DOIS TEMPOS
    // ============================================================
    {
      scenario: 'Não: HT 1x0 → FT 2x1 (gols nos 2 tempos)',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Não: HT 0x1 → FT 2x2 (gols nos 2 tempos)',
      eventDetails: 'Não',
      homeScoreHT: 0,
      awayScoreHT: 1,
      homeScoreFT: 2,
      awayScoreFT: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Não: HT 1x1 → FT 3x2 (gols nos 2 tempos)',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 3,
      awayScoreFT: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🔤 VARIAÇÕES DE TEXTO
    // ============================================================
    {
      scenario: 'sim (minúsculo): HT 1x0 → FT 2x1',
      eventDetails: 'sim',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'SIM (maiúsculo): HT 1x0 → FT 2x1',
      eventDetails: 'SIM',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'não (minúsculo): HT 0x0 → FT 1x0',
      eventDetails: 'não',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 1,
      awayScoreFT: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'nao (sem til): HT 0x0 → FT 1x0',
      eventDetails: 'nao',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 1,
      awayScoreFT: 0,
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
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      expected: {
        result: Result.void,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Texto vazio: ""',
      eventDetails: '',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      expected: {
        result: Result.void,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🎯 EDGE CASES - MÚLTIPLOS GOLS
    // ============================================================
    {
      scenario: 'Sim: HT 3x2 → FT 5x4 (gols nos 2 tempos)',
      eventDetails: 'Sim',
      homeScoreHT: 3,
      awayScoreHT: 2,
      homeScoreFT: 5,
      awayScoreFT: 4,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Não: HT 1x0 → FT 1x0 (sem gols no 2º tempo)',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 1,
      awayScoreFT: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Sim: HT 0x1 → FT 0x1 (sem gols no 2º tempo)',
      eventDetails: 'Sim',
      homeScoreHT: 0,
      awayScoreHT: 1,
      homeScoreFT: 0,
      awayScoreFT: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test) => {
    const result = analyzeGolNosDoisTempos(
      test.eventDetails,
      test.homeScoreHT,
      test.awayScoreHT,
      test.homeScoreFT,
      test.awayScoreFT,
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
