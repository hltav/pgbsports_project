import { Result } from '@prisma/client';
import { analyzeHandicapPorTempo } from './../../shared/results/analysis';

// Helper local que replica a lógica do analyzer para gerar o EXPECTED
function computeExpectedFromDetails(
  details: string,
  home: number,
  away: number,
): { result: Result; shouldUpdate: boolean } {
  const normalized = details.toLowerCase().trim();

  // extrai primeiro número com sinal (mesma regex do analyzer)
  const match = normalized.match(/([+-]?\d+\.?\d*)/);
  if (!match) {
    return { result: Result.void, shouldUpdate: true };
  }

  const handicap = parseFloat(match[1]);
  const isCasa = normalized.includes('casa');
  const isFora = normalized.includes('fora');

  if (!isCasa && !isFora) {
    return { result: Result.void, shouldUpdate: true };
  }

  let won = false;

  if (isCasa) {
    const adjustedHome = home + handicap;
    const adjustedAway = away;
    won = adjustedHome > adjustedAway;
  } else {
    const adjustedHome = home;
    const adjustedAway = away + handicap;
    won = adjustedAway > adjustedHome;
  }

  return { result: won ? Result.win : Result.lose, shouldUpdate: true };
}

function generateTests() {
  const tests: Array<{
    scenario: string;
    eventDetails: string;
    homeScoreHT: number;
    awayScoreHT: number;
    expected: { result: Result; shouldUpdate: boolean };
  }> = [];

  const sides = ['Casa', 'Fora'];

  // handicaps including asian-like fractions and integers up to ±3
  const handicaps: number[] = [
    -3, -2.5, -2, -1.5, -1.25, -1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1,
    1.25, 1.5, 2, 2.5, 3,
  ];

  // scores 0..5 => 6*6 = 36 combos
  const maxScore = 5;

  for (const side of sides) {
    for (const handicap of handicaps) {
      const hdStr = (handicap >= 0 ? `+${handicap}` : `${handicap}`).replace(
        '.0',
        '',
      );
      const details = `${side} ${hdStr} 1º Tempo`;

      for (let h = 0; h <= maxScore; h++) {
        for (let a = 0; a <= maxScore; a++) {
          const expected = computeExpectedFromDetails(details, h, a);
          const scenario = `${details} — HT ${h}x${a} → EXPECT ${Result[expected.result]}`;
          tests.push({
            scenario,
            eventDetails: details,
            homeScoreHT: h,
            awayScoreHT: a,
            expected,
          });
        }
      }
    }
  }

  // adicionar casos inválidos para Result.void
  const invalids = [
    { details: 'Casa ??? 1º Tempo', h: 1, a: 0 },
    { details: 'Fora sem numero', h: 0, a: 1 },
    { details: 'Linha inválida', h: 2, a: 2 },
    { details: 'Casa +-abc 1º Tempo', h: 1, a: 1 },
    { details: 'Something else 0.5', h: 0, a: 0 },
  ];

  for (const inv of invalids) {
    tests.push({
      scenario: `INVALID — ${inv.details} — HT ${inv.h}x${inv.a} → VOID`,
      eventDetails: inv.details,
      homeScoreHT: inv.h,
      awayScoreHT: inv.a,
      expected: { result: Result.void, shouldUpdate: true },
    });
  }

  return tests;
}

function run() {
  const tests = generateTests();

  let passed = 0;
  let failed = 0;

  tests.forEach((test, idx) => {
    const result = analyzeHandicapPorTempo(
      test.eventDetails,
      test.homeScoreHT,
      test.awayScoreHT,
    );

    const ok =
      result.result === test.expected.result &&
      result.shouldUpdate === test.expected.shouldUpdate;

    if (ok) passed++;
    else failed++;

    // print progress every 100 tests to avoid huge immediate output
    if (idx % 100 === 0 || !ok) {
      console.log(
        `${ok ? '✅' : '❌'} ${test.scenario} → ${Result[result.result]} (shouldUpdate: ${result.shouldUpdate})`,
      );
      if (!ok) {
        console.log(
          `   Esperado: ${Result[test.expected.result]} (shouldUpdate: ${test.expected.shouldUpdate})`,
        );
        console.log(
          `   Recebido: ${Result[result.result]} (shouldUpdate: ${result.shouldUpdate})`,
        );
      }
    }
  });

  console.log(`\n📊 ${passed}/${tests.length} testes passaram`);
  if (failed > 0) console.log(`❌ ${failed} teste(s) falharam`);
}

run();
