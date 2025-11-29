import { Result } from '@prisma/client';
import { analyzeIntervaloFinal } from './../../shared/thesportsdb-api/services/analysis/futebol/intervalFinal.analysis';

function run() {
  const tests = [
    // ============================================================
    // ✅ INTERVALO CORRETO - FINAL CORRETO
    // ============================================================
    {
      scenario: 'Casa/Casa: HT 1x0 (casa na frente) → FT 2x1 (casa ganha)',
      details: 'casa/casa',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Empate/Fora: HT 0x0 (empate) → FT 1x2 (fora ganha)',
      details: 'empate/fora',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScore: 1,
      awayScore: 2,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Fora/Empate: HT 0x1 (fora na frente) → FT 1x1 (empate)',
      details: 'fora/empate',
      homeScoreHT: 0,
      awayScoreHT: 1,
      homeScore: 1,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ============================================================
    // ❌ INTERVALO ERRADO - EARLY LOSE
    // ============================================================
    {
      scenario: 'Casa/Casa: HT 0x1 (não é casa) → LOSE EARLY',
      details: 'casa/casa',
      homeScoreHT: 0,
      awayScoreHT: 1,
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Empate/Fora: HT 1x0 (não é empate) → LOSE EARLY',
      details: 'empate/fora',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScore: 1,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'Fora/Casa: HT 1x0 (não é fora) → LOSE EARLY',
      details: 'fora/casa',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // ============================================================
    // ✅ INTERVALO CORRETO - FINAL ERRADO
    // ============================================================
    {
      scenario: 'Casa/Casa: HT 1x0 (casa certo) → FT 1x2 (casa perdeu)',
      details: 'casa/casa',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScore: 1,
      awayScore: 2,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'Empate/Fora: HT 0x0 (empate certo) → FT 2x1 (não é fora)',
      details: 'empate/fora',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ============================================================
    // 🔢 USANDO NÚMEROS (1/X/2)
    // ============================================================
    {
      scenario: '1/1: HT 2x1 (1 correto) → FT 3x2 (1 correto)',
      details: '1/1',
      homeScoreHT: 2,
      awayScoreHT: 1,
      homeScore: 3,
      awayScore: 2,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'X/2: HT 1x1 (X correto) → FT 1x3 (2 correto)',
      details: 'x/2',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScore: 1,
      awayScore: 3,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: '2/1: HT 0x2 (2 correto) → FT 2x3 (1 certo)',
      details: '2/1',
      homeScoreHT: 0,
      awayScoreHT: 2,
      homeScore: 2,
      awayScore: 3,
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
    const result = analyzeIntervaloFinal(
      test.details,
      test.homeScoreHT,
      test.awayScoreHT,
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
      `${testPassed ? '✅' : '❌'} ${test.scenario} → ${Result[result.result]}`,
    );

    if (!testPassed) {
      console.log(
        `   Esperado: ${Result[test.expected.result]} (early: ${test.expected.isFinalizableEarly})`,
      );
      console.log(
        `   Recebido: ${Result[result.result]} (early: ${result.isFinalizableEarly})`,
      );
    }
  });

  console.log(`\n📊 ${passed}/${tests.length} testes passaram`);
  if (failed > 0) {
    console.log(`❌ ${failed} teste(s) falharam`);
  }
}

run();
