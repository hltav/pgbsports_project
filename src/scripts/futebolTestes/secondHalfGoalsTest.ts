import { Result } from '@prisma/client';
import { analyzeGolsSegundoTempo } from './../../shared/thesportsdb-api/services/analysis/futebol/secondHalfGoals.analysis';

type MatchStatus = 'first_half' | 'half_time' | 'second_half';

function run() {
  const tests = [
    // ========== MAIS / OVER — second_half (jogo rolando) ==========
    {
      scenario: 'OVER 0.5 — second_half: HT 0x0, FT 1x0 → WIN (venceu)',
      details: 'Mais de 0.5',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 1,
      awayScoreFT: 0,
      matchStatus: 'second_half' as MatchStatus,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true, // 1 > 0.5 → ganhou (2H = 1 gol)
      },
    },
    {
      scenario:
        'OVER 1.5 — second_half: HT 0x0, FT 1x0 → APOSTA VIVA (pode chegar a 2+)',
      details: 'Mais de 1.5',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 1,
      awayScoreFT: 0,
      matchStatus: 'second_half' as MatchStatus,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false, // pode chegar a 2+ antes do FT (2H = 1 gol)
      },
    },
    {
      scenario: 'OVER 1.5 — second_half: HT 1x0, FT 2x1 → WIN (venceu)',
      details: 'Over 1.5',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      matchStatus: 'second_half' as MatchStatus,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true, // 2 > 1.5 → ganhou (2H = 2 gols)
      },
    },

    // ========== MENOS / UNDER — second_half (jogo rolando) ==========
    {
      scenario: 'UNDER 1.5 — second_half: HT 1x0, FT 1x1 → WIN (venceu)',
      details: 'Menos de 1.5',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 1,
      awayScoreFT: 1,
      matchStatus: 'second_half' as MatchStatus,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true, // 1 < 1.5 → ganhou (2H = 1 gol)
      },
    },
    {
      scenario: 'UNDER 0.5 — second_half: HT 0x0, FT 1x0 → LOSE (impossível)',
      details: 'Under 0.5',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 1,
      awayScoreFT: 0,
      matchStatus: 'second_half' as MatchStatus,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true, // 1 >= 0.5 → early lose (2H = 1 gol)
      },
    },
    {
      scenario: 'UNDER 2.5 — second_half: HT 1x0, FT 2x1 → WIN (venceu)',
      details: 'Under 2.5',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      matchStatus: 'second_half' as MatchStatus,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true, // 2 < 2.5 → ganhou (2H = 2 gols)
      },
    },

    // ========== OVER — finalized (jogo finalizado) ==========
    {
      scenario: 'OVER 0.5 — finalized: HT 0x0, FT 1x0 → WIN (finalizável)',
      details: 'over 0.5',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 1,
      awayScoreFT: 0,
      matchStatus: 'half_time' as MatchStatus,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true, // Resultado final
      },
    },
    {
      scenario:
        'OVER 2.5 — finalized: HT 1x0, FT 2x1 → LOSE (finalizável, não ganhou)',
      details: 'Over 2.5',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      matchStatus: 'half_time' as MatchStatus,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true, // Resultado final, não muda mais (2H = 2 gols)
      },
    },

    // ========== UNDER — finalized (jogo finalizado) ==========
    {
      scenario: 'UNDER 0.5 — finalized: HT 0x0, FT 0x0 → WIN (finalizável)',
      details: 'Menos de 0.5',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 0,
      awayScoreFT: 0,
      matchStatus: 'half_time' as MatchStatus,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true, // Resultado final (2H = 0 gols)
      },
    },
    {
      scenario:
        'UNDER 1.5 — finalized: HT 1x0, FT 3x1 → LOSE (finalizável, impossível)',
      details: 'Under 1.5',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 3,
      awayScoreFT: 1,
      matchStatus: 'half_time' as MatchStatus,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true, // Resultado final (2H = 3 gols >= 1.5)
      },
    },

    // ========== OVER — second_half (confirmação com FT definitivo) ==========
    {
      scenario: 'OVER 0.5 — second_half final: HT 0x0, FT 2x1 → WIN',
      details: 'over 0.5',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      matchStatus: 'second_half' as MatchStatus,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true, // 3 > 0.5 → ganhou (2H = 3 gols)
      },
    },
    {
      scenario: 'OVER 4.5 — second_half: HT 1x0, FT 2x1 → LOSE (impossível)',
      details: 'Over 4.5',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      matchStatus: 'second_half' as MatchStatus,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false, // 2 >= 4.5? Não, mas é impossível ganhar (2H = 2 gols)
      },
    },

    // ========== FORMATO INVÁLIDO ==========
    {
      scenario: "FORMATO INVÁLIDO — 'gols 2h'",
      details: 'gols 2h',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 1,
      awayScoreFT: 0,
      matchStatus: 'second_half' as MatchStatus,
      expected: {
        result: Result.void,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: "FORMATO INVÁLIDO — 'mais de'",
      details: 'mais de',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
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
    const result = analyzeGolsSegundoTempo(
      test.details,
      test.homeScoreHT,
      test.awayScoreHT,
      test.homeScoreFT,
      test.awayScoreFT,
      test.matchStatus,
    );

    const isFinalizableEarly = result.isFinalizableEarly ?? false;

    const ok =
      result.result === test.expected.result &&
      result.shouldUpdate === test.expected.shouldUpdate &&
      isFinalizableEarly === test.expected.isFinalizableEarly;

    if (ok) passed++;
    else failed++;

    const gols2H =
      test.homeScoreFT -
      test.homeScoreHT +
      (test.awayScoreFT - test.awayScoreHT);

    console.log(
      `${ok ? '✅' : '❌'} ${test.scenario} (2H: ${gols2H} gols) → ${
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
