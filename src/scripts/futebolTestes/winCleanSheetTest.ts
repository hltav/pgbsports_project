import { Result } from '@prisma/client';
import { analyzeVenceSemSofrerGol } from './../../shared/thesportsdb-api/services/analysis/futebol/winCleanSheet.analysis';

function run() {
  const tests = [
    // ============================================================
    // 🟦 SIM - VENCER SEM SOFRER GOL
    // ============================================================
    {
      scenario: 'Sim: 1x0 (casa vence sem sofrer)',
      eventDetails: 'Sim',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Sim: 2x0 (casa vence sem sofrer)',
      eventDetails: 'Sim',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Sim: 0x1 (fora vence sem sofrer)',
      eventDetails: 'Sim',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Sim: 0x3 (fora vence sem sofrer)',
      eventDetails: 'Sim',
      homeScore: 0,
      awayScore: 3,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟥 SIM - NÃO VENCER SEM SOFRER GOL
    // ============================================================
    {
      scenario: 'Sim: 1x1 (empate - não vence)',
      eventDetails: 'Sim',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Sim: 0x0 (empate - não vence)',
      eventDetails: 'Sim',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Sim: 2x1 (casa vence mas sofre gol)',
      eventDetails: 'Sim',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario:
        'Sim: 1x2 (fora vence mas casa sofre - não é vitória sem sofrer)',
      eventDetails: 'Sim',
      homeScore: 1,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Sim: 0x2 (fora vence sem sofrer)',
      eventDetails: 'Sim',
      homeScore: 0,
      awayScore: 2,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Sim: 2x0 depois fica fora na frente 2x2 (derrota)',
      eventDetails: 'Sim',
      homeScore: 1,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟦 NÃO - NÃO VENCER SEM SOFRER GOL
    // ============================================================
    {
      scenario: 'Não: 1x1 (empate - não é vitória sem sofrer)',
      eventDetails: 'Não',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Não: 0x0 (empate - não é vitória sem sofrer)',
      eventDetails: 'Não',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Não: 2x1 (casa vence mas sofre gol)',
      eventDetails: 'Não',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Não: 1x2 (fora vence mas casa sofre)',
      eventDetails: 'Não',
      homeScore: 1,
      awayScore: 2,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Não: 0x2 (fora vence sem sofrer - deve ser LOSE)',
      eventDetails: 'Não',
      homeScore: 0,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🟥 NÃO - VENCER SEM SOFRER GOL
    // ============================================================
    {
      scenario: 'Não: 1x0 (casa vence sem sofrer - deve ser LOSE)',
      eventDetails: 'Não',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Não: 2x0 (casa vence sem sofrer - deve ser LOSE)',
      eventDetails: 'Não',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Não: 0x1 (fora vence sem sofrer - deve ser LOSE)',
      eventDetails: 'Não',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Não: 0x3 (fora vence sem sofrer - deve ser LOSE)',
      eventDetails: 'Não',
      homeScore: 0,
      awayScore: 3,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🔤 VARIAÇÕES DE TEXTO
    // ============================================================
    {
      scenario: 'sim (minúsculo): 2x0',
      eventDetails: 'sim',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'SIM (maiúsculo): 2x0',
      eventDetails: 'SIM',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'yes (inglês): 0x2',
      eventDetails: 'yes',
      homeScore: 0,
      awayScore: 2,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'YES (inglês maiúsculo): 0x2',
      eventDetails: 'YES',
      homeScore: 0,
      awayScore: 2,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: '  Sim  (com espaços): 1x0',
      eventDetails: '  Sim  ',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // ⚠️ CASOS AMBÍGUOS (NÃO é Sim nem Não explícito)
    // ============================================================
    {
      scenario: 'Não (Não é Sim): 1x1',
      eventDetails: 'Não',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Nao (sem til): 1x1',
      eventDetails: 'Nao',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'No (inglês): 1x1',
      eventDetails: 'No',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },

    // ============================================================
    // 🎯 EDGE CASES - MUITOS GOLS
    // ============================================================
    {
      scenario: 'Sim: 5x0 (goleada sem sofrer)',
      eventDetails: 'Sim',
      homeScore: 5,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Sim: 0x5 (goleada sem sofrer)',
      eventDetails: 'Sim',
      homeScore: 0,
      awayScore: 5,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Não: 5x4 (muitos gols em ambos tempos)',
      eventDetails: 'Não',
      homeScore: 5,
      awayScore: 4,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test) => {
    const result = analyzeVenceSemSofrerGol(
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
