import { Result } from '@prisma/client';
import { analyzePlacarExatoImproved } from './../../shared/thesportsdb-api/services/analysis/futebol/exactScore.analysis';

function run() {
  const tests = [
    {
      scenario: 'Esperado 1x1, Atual 0x0 (1º tempo)',
      expectedScore: '1x1',
      currentScore: { home: 0, away: 0 },
      expected: { result: Result.lose, isFinalizableEarly: false },
    },
    {
      scenario: 'Esperado 1x1, Atual 2x0 (impossível)',
      expectedScore: '1x1',
      currentScore: { home: 2, away: 0 },
      expected: { result: Result.lose, isFinalizableEarly: true },
    },
    {
      scenario: 'Esperado 1x1, Atual 0x2 (impossível)',
      expectedScore: '1x1',
      currentScore: { home: 0, away: 2 },
      expected: { result: Result.lose, isFinalizableEarly: true },
    },
    {
      scenario: 'Esperado 2x1, Atual 1x0 (possível)',
      expectedScore: '2x1',
      currentScore: { home: 1, away: 0 },
      expected: { result: Result.lose, isFinalizableEarly: false },
    },
    {
      scenario: 'Esperado 1x1, Atual 1x1 (ganhou, jogo finalizado!)',
      expectedScore: '1x1',
      currentScore: { home: 1, away: 1 },
      expected: { result: Result.win, isFinalizableEarly: true },
    },
  ];

  tests.forEach((test) => {
    const result = analyzePlacarExatoImproved(
      test.expectedScore,
      test.currentScore.home,
      test.currentScore.away,
    );

    // Use valor padrão caso isFinalizableEarly seja undefined
    const isFinalizableEarly = result.isFinalizableEarly ?? false;

    const passed =
      result.result === test.expected.result &&
      isFinalizableEarly === test.expected.isFinalizableEarly;

    console.log(
      `${passed ? '✅' : '❌'} ${test.scenario} → ${Result[result.result]} (finalizável: ${isFinalizableEarly})`,
    );

    if (!passed) {
      console.log(
        `   Esperado: ${Result[test.expected.result]} (finalizável: ${test.expected.isFinalizableEarly})`,
      );
    }
  });
}

run();
