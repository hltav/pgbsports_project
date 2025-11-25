import { Result } from '@prisma/client';
import { analyzeVencedor2oTempo } from '../../shared/thesportsdb-api/services/analysis/futebol/winnerSecondHalf.analysis';
import { EventStatus } from './../../shared/thesportsdb-api/enums/eventStatus.enum';

function run() {
  const FIN = EventStatus.FINISHED;

  const tests = [
    // ======================
    // CASA — JOGO FINALIZADO
    // ======================
    {
      scenario: 'CASA — 2H 2x1 → WIN',
      eventDetails: 'Casa',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      matchStatus: FIN,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'CASA — 2H 0x1 → LOSE',
      eventDetails: 'Casa',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 1,
      awayScoreFT: 1,
      matchStatus: FIN,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ======================
    // EMPATE — FINALIZADO
    // ======================
    {
      scenario: 'EMPATE — 2H 1x1 → WIN',
      eventDetails: 'Empate',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      matchStatus: FIN,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'EMPATE — 2H 2x1 → LOSE',
      eventDetails: 'Empate',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      matchStatus: FIN,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ======================
    // FORA — FINALIZADO
    // ======================
    {
      scenario: 'FORA — 2H 0x2 → WIN',
      eventDetails: 'Fora',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 1,
      awayScoreFT: 2,
      matchStatus: FIN,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'FORA — 2H 2x1 → LOSE',
      eventDetails: 'Fora',
      homeScoreHT: 0,
      awayScoreHT: 1,
      homeScoreFT: 2,
      awayScoreFT: 1,
      matchStatus: FIN,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // ======================
    // DETALHES INVÁLIDOS
    // ======================
    {
      scenario: 'DETALHES INVÁLIDOS → VOID',
      eventDetails: 'qualquer_coisa',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 2,
      awayScoreFT: 2,
      matchStatus: FIN,
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
    const result = analyzeVencedor2oTempo(
      test.eventDetails,
      test.homeScoreHT,
      test.awayScoreHT,
      test.homeScoreFT,
      test.awayScoreFT,
      test.matchStatus,
    );

    const early = result.isFinalizableEarly ?? false;
    const expectedEarly = test.expected.isFinalizableEarly ?? false;

    const ok =
      result.result === test.expected.result &&
      result.shouldUpdate === test.expected.shouldUpdate &&
      early === expectedEarly;

    if (ok) passed++;
    else failed++;

    console.log(
      `${ok ? '✅' : '❌'} ${test.scenario} → ${Result[result.result]} (early: ${early})`,
    );

    if (!ok) {
      console.log(
        `   Esperado: ${Result[test.expected.result]} (early: ${expectedEarly})`,
      );
      console.log(`   Recebido: ${Result[result.result]} (early: ${early})`);
    }
  });

  console.log(`\n📊 ${passed}/${tests.length} testes passaram`);
  if (failed > 0) console.log(`❌ ${failed} falharam`);
}

run();
