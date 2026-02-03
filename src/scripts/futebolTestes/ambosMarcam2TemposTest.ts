import { Result } from '@prisma/client';
import { analyzeAmbasMarcamEmAmbosTempos } from '../../shared/results/analysis';

function run() {
  const tests = [
    // ===== SIM - JOGO FINALIZADO =====
    {
      scenario: 'SIM — FT: HT 1x1 e FT 2x2 → WIN (ambas nos dois tempos)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 2,
      awayScoreFT: 2,
      isMatchFinished: true,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'SIM — FT: HT 1x0 e FT 2x1 → LOSE (não houve ambas no HT)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      isMatchFinished: true,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'SIM — FT: HT 1x1 e FT 2x1 → LOSE (não houve ambas no 2H)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 2,
      awayScoreFT: 1,
      isMatchFinished: true,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ===== NÃO - JOGO FINALIZADO =====
    {
      scenario:
        'NÃO — FT: HT 1x0 e FT 2x1 → WIN (não houve ambas nos dois tempos)',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      isMatchFinished: true,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario:
        'NÃO — FT: HT 0x0 e FT 2x0 → WIN (não houve ambas nos dois tempos)',
      eventDetails: 'Não',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 0,
      isMatchFinished: true,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'NÃO — FT: HT 1x1 e FT 2x2 → LOSE (ambas nos dois tempos)',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 2,
      awayScoreFT: 2,
      isMatchFinished: true,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ===== SIM - EM ANDAMENTO (EARLY FINISH) =====
    {
      scenario: 'SIM — 2H: HT 1x0 (não ambas) → EARLY LOSE (impossível ganhar)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 1,
      awayScoreFT: 0,
      isMatchFinished: false,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'SIM — 2H: HT 1x1, 2H 1x1 → EARLY WIN (ambas confirmadas)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 2,
      awayScoreFT: 2,
      isMatchFinished: false,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'SIM — 2H: HT 1x1, 2H 0x0 (só HT ok) → ESPERA (aposta viva)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 1,
      awayScoreFT: 1,
      isMatchFinished: false,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ===== NÃO - EM ANDAMENTO (EARLY FINISH) =====
    {
      scenario: 'NÃO — 2H: HT 1x0 (não ambas) → EARLY WIN (garantiu vitória)',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 1,
      awayScoreFT: 0,
      isMatchFinished: false,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'NÃO — 2H: HT 0x0 → EARLY WIN (garante, sem condição HT)',
      eventDetails: 'Não',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 0,
      awayScoreFT: 0,
      isMatchFinished: false,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'NÃO — 2H: HT 1x1, 2H 1x1 → EARLY LOSE (ambas nos dois tempos)',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 2,
      awayScoreFT: 2,
      isMatchFinished: false,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'NÃO — 2H: HT 1x1, 2H 0x0 (só HT ok) → ESPERA (aposta viva)',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 1,
      awayScoreFT: 1,
      isMatchFinished: false,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test) => {
    const result = analyzeAmbasMarcamEmAmbosTempos(
      test.eventDetails,
      test.homeScoreHT,
      test.awayScoreHT,
      test.homeScoreFT,
      test.awayScoreFT,
      test.isMatchFinished,
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
