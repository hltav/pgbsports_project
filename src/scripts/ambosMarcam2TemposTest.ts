import { Result } from '@prisma/client';
import { analyzeAmbasMarcamEmAmbosTempos } from './../shared/thesportsdb-api/services/analysis';

function run() {
  const tests = [
    {
      scenario: 'SIM — HT 1x1 e FT 2x2 → ganhou (ambos marcaram nos 2 tempos)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 2,
      awayScoreFT: 2,
      expected: { result: Result.win, shouldUpdate: true },
    },
    {
      scenario: 'SIM — HT 1x0 e FT 2x1 → perdeu (não houve gol dos dois no HT)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      expected: { result: Result.lose, shouldUpdate: true },
    },
    {
      scenario:
        'NÃO — HT 1x0 e FT 2x1 → ganhou (não aconteceu ambas nos dois tempos)',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      expected: { result: Result.win, shouldUpdate: true },
    },
    {
      scenario:
        'NÃO — HT 1x1 e FT 2x2 → perdeu (ambas marcaram nos dois tempos)',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 2,
      awayScoreFT: 2,
      expected: { result: Result.lose, shouldUpdate: true },
    },
    {
      scenario: 'Market inválido → void',
      eventDetails: 'qualquer coisa',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 1,
      awayScoreFT: 0,
      expected: {
        result: Result.void,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
  ];

  tests.forEach((test) => {
    const result = analyzeAmbasMarcamEmAmbosTempos(
      test.eventDetails,
      test.homeScoreHT,
      test.awayScoreHT,
      test.homeScoreFT,
      test.awayScoreFT,
    );

    // como antes, valor padrão
    const isFinalizableEarly = result.isFinalizableEarly ?? false;

    const passed =
      result.result === test.expected.result &&
      result.shouldUpdate === test.expected.shouldUpdate &&
      isFinalizableEarly === (test.expected.isFinalizableEarly ?? false);

    console.log(
      `${passed ? '✅' : '❌'} ${test.scenario} → ${
        Result[result.result]
      } (finalizável: ${isFinalizableEarly})`,
    );

    if (!passed) {
      console.log(
        `   Esperado: ${Result[test.expected.result]} (finalizável: ${
          test.expected.isFinalizableEarly ?? false
        })`,
      );
    }
  });
}

run();
