import { Result } from '@prisma/client';
import { analyzeAmbasMarcamPrimeiroTempo } from './../../shared/results/analysis';

function run() {
  const tests = [
    // ============================================================
    // 🟦 SIM — JOGO FINALIZADO
    // ============================================================
    {
      scenario: 'SIM — HT 1x1 → WIN (ambas marcaram no 1º tempo)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 1,
      isFinalized: true,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'SIM — HT 1x0 → LOSE (não houve ambas no HT)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 0,
      isFinalized: true,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // ============================================================
    // 🔴 NÃO — JOGO FINALIZADO
    // ============================================================
    {
      scenario: 'NÃO — HT 1x0 → WIN (não houve ambas no HT)',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 0,
      isFinalized: true,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'NÃO — HT 0x0 → WIN (não houve ambas no HT)',
      eventDetails: 'Não',
      homeScoreHT: 0,
      awayScoreHT: 0,
      isFinalized: true,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'NÃO — HT 1x1 → LOSE (ambas marcaram no 1º tempo)',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 1,
      isFinalized: true,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // ============================================================
    // 🟦 SIM — EM ANDAMENTO (EARLY FINISH)
    // ============================================================
    {
      scenario: 'SIM — 10 min: 1x1 → EARLY WIN (ambas já marcaram)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 1,
      isFinalized: false,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'SIM — 40 min: 1x0 → APOSTA VIVA (aguarda)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 0,
      isFinalized: false,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'SIM — 43 min: 0x0 → APOSTA VIVA (aguarda)',
      eventDetails: 'Sim',
      homeScoreHT: 0,
      awayScoreHT: 0,
      isFinalized: false,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ============================================================
    // 🔴 NÃO — EM ANDAMENTO (EARLY FINISH)
    // ============================================================
    {
      scenario: 'NÃO — 10 min: 1x1 → EARLY LOSE (ambas marcaram)',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 1,
      isFinalized: false,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'NÃO — 40 min: 1x0 → APOSTA VIVA (aguarda)',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 0,
      isFinalized: false,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'NÃO — 43 min: 0x0 → APOSTA VIVA (aguarda)',
      eventDetails: 'Não',
      homeScoreHT: 0,
      awayScoreHT: 0,
      isFinalized: false,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test) => {
    const result = analyzeAmbasMarcamPrimeiroTempo(
      test.eventDetails,
      test.homeScoreHT,
      test.awayScoreHT,
      test.isFinalized,
    );

    const isFinalizableEarly = result.isFinalizableEarly ?? false;

    const testPassed =
      result.result === test.expected.result &&
      result.shouldUpdate === test.expected.shouldUpdate &&
      isFinalizableEarly === test.expected.isFinalizableEarly;

    if (testPassed) {
      passed++;
    } else {
      failed++;
    }

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
  if (failed > 0) {
    console.log(`❌ ${failed} teste(s) falharam`);
  }
}

run();
