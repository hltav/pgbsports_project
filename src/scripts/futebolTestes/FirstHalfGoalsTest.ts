import { Result } from '@prisma/client';
import { analyzeGolsPrimeiroTempo } from './../../shared/results/analysis';

type MatchStatus = 'first_half' | 'half_time' | 'second_half';

function run() {
  const tests = [
    // ========== MAIS / OVER — first_half (jogo rolando) ==========
    {
      scenario: 'OVER 0.5 — first_half: 1x0 → WIN (venceu)',
      details: 'Mais de 0.5',
      homeScoreHT: 1,
      awayScoreHT: 0,
      matchStatus: 'first_half' as MatchStatus,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true, // 1 > 0.5 → ganhou
      },
    },
    {
      scenario: 'OVER 1.5 — first_half: 1x0 → APOSTA VIVA (pode chegar a 2+)',
      details: 'Mais de 1.5',
      homeScoreHT: 1,
      awayScoreHT: 0,
      matchStatus: 'first_half' as MatchStatus,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false, // pode chegar a 2+ antes do HT
      },
    },
    {
      scenario: 'OVER 1.5 — first_half: 2x0 → WIN (venceu)',
      details: 'Over 1.5',
      homeScoreHT: 2,
      awayScoreHT: 0,
      matchStatus: 'first_half' as MatchStatus,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true, // 2 > 1.5 → ganhou
      },
    },

    // ========== MENOS / UNDER — first_half (jogo rolando) ==========
    {
      scenario: 'UNDER 1.5 — first_half: 1x0 → WIN (venceu)',
      details: 'Menos de 1.5',
      homeScoreHT: 1,
      awayScoreHT: 0,
      matchStatus: 'first_half' as MatchStatus,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true, // 1 < 1.5 → ganhou
      },
    },
    {
      scenario: 'UNDER 0.5 — first_half: 1x0 → LOSE (impossível)',
      details: 'Under 0.5',
      homeScoreHT: 1,
      awayScoreHT: 0,
      matchStatus: 'first_half' as MatchStatus,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true, // 1 >= 0.5 → early lose
      },
    },
    {
      scenario: 'UNDER 2.5 — first_half: 2x0 → WIN (venceu)',
      details: 'Under 2.5',
      homeScoreHT: 2,
      awayScoreHT: 0,
      matchStatus: 'first_half' as MatchStatus,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true, // 2 < 2.5 → ganhou
      },
    },

    // ========== OVER — half_time (intervalo) ==========
    {
      scenario: 'OVER 0.5 — half_time: 1x0 → WIN (finalizável)',
      details: 'over 0.5',
      homeScoreHT: 1,
      awayScoreHT: 0,
      matchStatus: 'half_time' as MatchStatus,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true, // Resultado final
      },
    },
    {
      scenario: 'OVER 2.5 — half_time: 2x0 → LOSE (finalizável, não ganhou)',
      details: 'Over 2.5',
      homeScoreHT: 2,
      awayScoreHT: 0,
      matchStatus: 'half_time' as MatchStatus,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true, // Resultado final, não muda mais
      },
    },

    // ========== UNDER — half_time (intervalo) ==========
    {
      scenario: 'UNDER 0.5 — half_time: 0x0 → WIN (finalizável)',
      details: 'Menos de 0.5',
      homeScoreHT: 0,
      awayScoreHT: 0,
      matchStatus: 'half_time' as MatchStatus,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true, // Resultado final
      },
    },
    {
      scenario: 'UNDER 1.5 — half_time: 2x0 → LOSE (finalizável, impossível)',
      details: 'Under 1.5',
      homeScoreHT: 2,
      awayScoreHT: 0,
      matchStatus: 'half_time' as MatchStatus,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true, // Resultado final
      },
    },

    // ========== OVER — second_half (segundo tempo) ==========
    {
      scenario: 'OVER 0.5 — second_half: 1x0 → WIN (finalizável)',
      details: 'over 0.5',
      homeScoreHT: 1,
      awayScoreHT: 0,
      matchStatus: 'second_half' as MatchStatus,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true, // Resultado do HT é imutável
      },
    },
    {
      scenario: 'OVER 2.5 — second_half: 2x0 → LOSE (finalizável)',
      details: 'Over 2.5',
      homeScoreHT: 2,
      awayScoreHT: 0,
      matchStatus: 'second_half' as MatchStatus,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true, // Resultado do HT é imutável
      },
    },

    // ========== FORMATO INVÁLIDO ==========
    {
      scenario: "FORMATO INVÁLIDO — 'gols ht'",
      details: 'gols ht',
      homeScoreHT: 1,
      awayScoreHT: 0,
      matchStatus: 'first_half' as MatchStatus,
      expected: {
        result: Result.void,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: "FORMATO INVÁLIDO — 'menos de'",
      details: 'menos de',
      homeScoreHT: 1,
      awayScoreHT: 0,
      matchStatus: 'half_time' as MatchStatus,
      expected: {
        result: Result.void,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
  ];

  // ======= EXECUÇÃO =======
  let passed = 0;
  let failed = 0;

  tests.forEach((test) => {
    const result = analyzeGolsPrimeiroTempo(
      test.details,
      test.homeScoreHT,
      test.awayScoreHT,
      test.matchStatus,
    );

    const isFinalizableEarly = result.isFinalizableEarly ?? false;

    const ok =
      result.result === test.expected.result &&
      result.shouldUpdate === test.expected.shouldUpdate &&
      isFinalizableEarly === test.expected.isFinalizableEarly;

    if (ok) passed++;
    else failed++;

    console.log(
      `${ok ? '✅' : '❌'} ${test.scenario} → ${
        Result[result.result]
      } (early: ${isFinalizableEarly})`,
    );

    if (!ok) {
      console.log(
        `   Esperado: ${Result[test.expected.result]} (early: ${test.expected.isFinalizableEarly})`,
      );
      console.log(
        `   Recebido: ${Result[result.result]} (early: ${isFinalizableEarly})`,
      );
    }
  });

  console.log(`\n📊 ${passed}/${tests.length} testes passaram.`);
  if (failed > 0) console.log(`❌ ${failed} teste(s) falharam.`);
}

run();
