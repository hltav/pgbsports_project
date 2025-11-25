import { Result } from '@prisma/client';
import { analyzeAmbasMarcam } from '../../shared/thesportsdb-api/services/analysis';

function run() {
  const tests = [
    // ============================
    // AMBOS MARCAM - SIM
    // ============================
    {
      scenario: 'SIM — 1x1 → WIN',
      eventDetails: 'Ambos Marcam - Sim',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'SIM — 1x0 → LOSE',
      eventDetails: 'Ambos Marcam - Sim',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // ============================
    // AMBOS MARCAM - NÃO
    // ============================
    {
      scenario: 'NÃO — 1x0 → WIN',
      eventDetails: 'Ambos Marcam - Não',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'NÃO — 1x1 → LOSE',
      eventDetails: 'Ambos Marcam - Não',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // Aceita "Nao" sem acento
    {
      scenario: 'NÃO — sem acento → WIN',
      eventDetails: 'Ambos Marcam - Nao',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // ============================
    // AMBOS MARCAM E +2.5
    // ============================
    {
      scenario: 'SIM & +2.5 — ambas + total >2.5 → WIN',
      eventDetails: 'Ambos Marcam e + 2.5',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'SIM & +2.5 — ambas mas total =2 → LOSE',
      eventDetails: 'Ambos Marcam e + 2.5',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'SIM & +2.5 — não ambas → LOSE',
      eventDetails: 'Ambos Marcam e + 2.5',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // ============================
    // AMBOS MARCAM OU +2.5
    // ============================
    {
      scenario: 'OU — ambas → WIN',
      eventDetails: 'Ambos Marcam ou + 2.5',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'OU — total > 2.5 → WIN',
      eventDetails: 'Ambos Marcam ou + 2.5',
      homeScore: 3,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'OU — ambas = false e total < 2.5 → PENDING (SÓ ESTE MERCADO!)',
      eventDetails: 'Ambos Marcam ou + 2.5',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.pending,
        shouldUpdate: false,
        isFinalizableEarly: false,
      },
    },

    // ============================
    // MERCADO INVÁLIDO
    // ============================
    {
      scenario: 'Mercado desconhecido → VOID',
      eventDetails: 'Ambas marcam ???',
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.void,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test) => {
    const result = analyzeAmbasMarcam(
      test.eventDetails,
      test.homeScore,
      test.awayScore,
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
