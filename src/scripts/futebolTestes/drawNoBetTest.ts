import { Result } from '@prisma/client';
import { analyzeEmpateAnulaAposta } from '../../shared/thesportsdb-api/services/analysis/futebol/drawNoBet.analysis';

function run() {
  const tests = [
    // ===========================
    //      JOGO FINALIZADO
    // ===========================

    {
      scenario: 'Casa — FT 2x1 → WIN (casa venceu)',
      eventDetails: 'Casa',
      homeScore: 2,
      awayScore: 1,
      isMatchFinished: true,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Casa — FT 1x2 → LOSE (casa perdeu)',
      eventDetails: 'Casa',
      homeScore: 1,
      awayScore: 2,
      isMatchFinished: true,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Casa — FT 1x1 → RETURNED (empate)',
      eventDetails: 'Casa',
      homeScore: 1,
      awayScore: 1,
      isMatchFinished: true,
      expected: {
        result: Result.returned,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    {
      scenario: 'Fora — FT 0x1 → WIN (fora venceu)',
      eventDetails: 'Fora',
      homeScore: 0,
      awayScore: 1,
      isMatchFinished: true,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Fora — FT 3x1 → LOSE (fora perdeu)',
      eventDetails: 'Fora',
      homeScore: 3,
      awayScore: 1,
      isMatchFinished: true,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Fora — FT 2x2 → RETURNED (empate)',
      eventDetails: 'Fora',
      homeScore: 2,
      awayScore: 2,
      isMatchFinished: true,
      expected: {
        result: Result.returned,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ===========================
    //       JOGO EM ANDAMENTO
    // ===========================

    {
      scenario: 'Casa — 70 min: 2x0 → PENDING (ainda pode virar)',
      eventDetails: 'Casa',
      homeScore: 2,
      awayScore: 0,
      isMatchFinished: false,
      expected: {
        result: Result.pending,
        shouldUpdate: false,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Fora — 80 min: 0x2 → PENDING (ainda pode virar)',
      eventDetails: 'Fora',
      homeScore: 0,
      awayScore: 2,
      isMatchFinished: false,
      expected: {
        result: Result.pending,
        shouldUpdate: false,
        isFinalizableEarly: false,
      },
    },
    {
      scenario:
        'Casa — 60 min: 1x1 → PENDING (empate parcial não garante void)',
      eventDetails: 'Casa',
      homeScore: 1,
      awayScore: 1,
      isMatchFinished: false,
      expected: {
        result: Result.pending,
        shouldUpdate: false,
        isFinalizableEarly: false,
      },
    },

    // ===========================
    //     MERCADO INVÁLIDO
    // ===========================

    {
      scenario: 'Inválido — eventDetails sem Casa/Fora → VOID',
      eventDetails: 'QualquerCoisa',
      homeScore: 1,
      awayScore: 0,
      isMatchFinished: true,
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
    const result = analyzeEmpateAnulaAposta(
      test.eventDetails,
      test.homeScore,
      test.awayScore,
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
