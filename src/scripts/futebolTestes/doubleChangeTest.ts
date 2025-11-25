import { Result } from '@prisma/client';
import { analyzeDuplaChance } from '../../shared/thesportsdb-api/services/analysis/futebol/doubleChange.analysis';

function run() {
  const tests = [
    // ======================
    // CASA OU EMPATE
    // ======================
    {
      scenario: 'Casa ou Empate — 1x0 → WIN (casa vence)',
      eventDetails: 'Casa ou Empate',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Casa ou Empate — 0x0 → WIN (empate)',
      eventDetails: 'Casa ou Empate',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Casa ou Empate — 0x1 → LOSE (fora vence)',
      eventDetails: 'Casa ou Empate',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // ======================
    // FORA OU EMPATE
    // ======================
    {
      scenario: 'Fora ou Empate — 0x1 → WIN (fora vence)',
      eventDetails: 'Fora ou Empate',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Fora ou Empate — 0x0 → WIN (empate)',
      eventDetails: 'Fora ou Empate',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Fora ou Empate — 1x0 → LOSE (casa vence)',
      eventDetails: 'Fora ou Empate',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // ======================
    // CASA OU FORA
    // ======================
    {
      scenario: 'Casa ou Fora — 1x0 → WIN (vitória da casa)',
      eventDetails: 'Casa ou Fora',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Casa ou Fora — 0x1 → WIN (vitória do fora)',
      eventDetails: 'Casa ou Fora',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Casa ou Fora — 1x1 → LOSE (empate)',
      eventDetails: 'Casa ou Fora',
      homeScore: 1,
      awayScore: 1,
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
    const result = analyzeDuplaChance(
      test.eventDetails,
      test.homeScore,
      test.awayScore,
    );

    const isFinalizableEarly = result.isFinalizableEarly ?? false;

    const testPassed =
      result.result === test.expected.result &&
      result.shouldUpdate === test.expected.shouldUpdate &&
      isFinalizableEarly === test.expected.isFinalizableEarly;

    if (testPassed) passed++;
    else failed++;

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
