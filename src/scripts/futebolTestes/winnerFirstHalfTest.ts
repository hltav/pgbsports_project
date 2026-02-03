import { Result } from '@prisma/client';
import { analyzeVencedorPrimeiroTempo } from './../../shared/results/analysis';

function run() {
  const tests = [
    // ===== CASA =====
    {
      scenario: 'CASA — HT 1x0 → WIN',
      details: 'Casa',
      homeScoreHT: 1,
      awayScoreHT: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'CASA — HT 0x1 → LOSE',
      details: 'Casa',
      homeScoreHT: 0,
      awayScoreHT: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // Testando alias "Home"
    {
      scenario: 'HOME — HT 2x1 → WIN',
      details: 'Home',
      homeScoreHT: 2,
      awayScoreHT: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // Testando alias "1"
    {
      scenario: '1 — HT 0x0 → LOSE (não venceu no HT)',
      details: '1',
      homeScoreHT: 0,
      awayScoreHT: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ===== EMPATE =====
    {
      scenario: 'EMPATE — HT 1x1 → WIN',
      details: 'Empate',
      homeScoreHT: 1,
      awayScoreHT: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'DRAW — HT 2x1 → LOSE',
      details: 'Draw',
      homeScoreHT: 2,
      awayScoreHT: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // alias "X"
    {
      scenario: 'X — HT 0x0 → WIN',
      details: 'X',
      homeScoreHT: 0,
      awayScoreHT: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ===== FORA =====
    {
      scenario: 'FORA — HT 0x1 → WIN',
      details: 'Fora',
      homeScoreHT: 0,
      awayScoreHT: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'AWAY — HT 1x0 → LOSE',
      details: 'Away',
      homeScoreHT: 1,
      awayScoreHT: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // alias "2"
    {
      scenario: '2 — HT 3x2 → LOSE',
      details: '2',
      homeScoreHT: 3,
      awayScoreHT: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ===== INVALIDO =====
    {
      scenario: 'DETALHES INVÁLIDOS → VOID',
      details: 'qualquer_coisa_invalida',
      homeScoreHT: 1,
      awayScoreHT: 0,
      expected: {
        result: Result.void,
        shouldUpdate: true,
        isFinalizableEarly: undefined, // voidResult() não define
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test) => {
    const result = analyzeVencedorPrimeiroTempo(
      test.details,
      test.homeScoreHT,
      test.awayScoreHT,
    );

    const isFinalizableEarly = result.isFinalizableEarly ?? false;
    const expectedEarly = test.expected.isFinalizableEarly ?? false;

    const testPassed =
      result.result === test.expected.result &&
      result.shouldUpdate === test.expected.shouldUpdate &&
      isFinalizableEarly === expectedEarly;

    if (testPassed) passed++;
    else failed++;

    console.log(
      `${testPassed ? '✅' : '❌'} ${test.scenario} → ${
        Result[result.result]
      } (early: ${isFinalizableEarly})`,
    );

    if (!testPassed) {
      console.log(
        `   Esperado: ${Result[test.expected.result]} (early: ${expectedEarly})`,
      );
      console.log(
        `   Recebido: ${Result[result.result]} (early: ${isFinalizableEarly})`,
      );
    }
  });

  console.log(`\n📊 ${passed}/${tests.length} testes passaram`);
  if (failed > 0) console.log(`❌ ${failed} teste(s) falharam`);
}

run();
