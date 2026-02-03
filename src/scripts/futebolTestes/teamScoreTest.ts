import { Result } from '@prisma/client';
import { analyzeEquipeMarca } from './../../shared/results/analysis';

function run() {
  const tests = [
    // 🟦 CASA: SIM (Time casa marca)
    {
      scenario: 'Casa: Sim → 1x0 (casa marcou)',
      eventDetails: 'Casa: Sim',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa: Sim → 2x1 (casa marcou)',
      eventDetails: 'Casa: Sim',
      homeScore: 2,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa: Sim → 0x1 (casa não marcou)',
      eventDetails: 'Casa: Sim',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // 🟥 CASA: NÃO (Time casa não marca)
    {
      scenario: 'Casa: Não → 0x1 (casa não marcou)',
      eventDetails: 'Casa: Não',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa: Não → 0x0 (casa não marcou)',
      eventDetails: 'Casa: Não',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa: Não → 1x0 (casa marcou)',
      eventDetails: 'Casa: Não',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // 🟦 FORA: SIM (Time fora marca)
    {
      scenario: 'Fora: Sim → 0x1 (fora marcou)',
      eventDetails: 'Fora: Sim',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Fora: Sim → 1x2 (fora marcou)',
      eventDetails: 'Fora: Sim',
      homeScore: 1,
      awayScore: 2,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Fora: Sim → 1x0 (fora não marcou)',
      eventDetails: 'Fora: Sim',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // 🟥 FORA: NÃO (Time fora não marca)
    {
      scenario: 'Fora: Não → 1x0 (fora não marcou)',
      eventDetails: 'Fora: Não',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Fora: Não → 0x0 (fora não marcou)',
      eventDetails: 'Fora: Não',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Fora: Não → 0x1 (fora marcou)',
      eventDetails: 'Fora: Não',
      homeScore: 0,
      awayScore: 1,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // 🔤 VARIAÇÕES DE TEXTO
    {
      scenario: 'casa: sim (minúsculo) → 1x0',
      eventDetails: 'casa: sim',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'CASA: SIM (maiúsculo) → 1x0',
      eventDetails: 'CASA: SIM',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa:Sim (sem espaço) → 1x0',
      eventDetails: 'Casa:Sim',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: '  Casa: Sim  (com espaços) → 1x0',
      eventDetails: '  Casa: Sim  ',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },

    // 🇬🇧 VARIAÇÕES EM INGLÊS
    {
      scenario: 'Casa: Yes → 2x0 (casa marcou)',
      eventDetails: 'Casa: Yes',
      homeScore: 2,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Fora: No → 0x0 (fora não marcou)',
      eventDetails: 'Fora: No',
      homeScore: 0,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },

    // ⚠️ CASOS AMBÍGUOS / INVÁLIDOS
    {
      scenario: 'Sim (apenas palavra) → 1x0 (nenhum critério atende)',
      eventDetails: 'Sim',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.lose, // Sem "casa" ou "fora", todos os if falham
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Casa (sem Sim/Não) → 1x0 (nenhum critério atende)',
      eventDetails: 'Casa',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.lose, // Sem "sim" ou "não", todos os if falham
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Texto inválido → 1x0',
      eventDetails: 'Invalido texto aqui',
      homeScore: 1,
      awayScore: 0,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
      },
    },

    // 🎯 EDGE CASES - MÚLTIPLOS GOLS
    {
      scenario: 'Casa: Sim → 5x3 (casa marcou)',
      eventDetails: 'Casa: Sim',
      homeScore: 5,
      awayScore: 3,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
    {
      scenario: 'Fora: Não → 10x0 (fora não marcou)',
      eventDetails: 'Fora: Não',
      homeScore: 10,
      awayScore: 0,
      expected: {
        result: Result.win,
        shouldUpdate: true,
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test) => {
    const result = analyzeEquipeMarca(
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
