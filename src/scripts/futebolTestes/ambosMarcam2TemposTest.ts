/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MatchStatus, Result } from '@prisma/client';
import { analyzeAmbasMarcamEmAmbosTempos } from '../../shared/results/analysis';

type Expected = {
  result: Result;
  shouldUpdate: boolean;
  isFinalizableEarly: boolean;
};

type TestCase = {
  scenario: string;
  eventDetails: string;
  homeScoreHT: number | null;
  awayScoreHT: number | null;
  homeScoreFT: number | null;
  awayScoreFT: number | null;
  status: MatchStatus;
  expected: Expected;
};

function early(v: any): boolean {
  return Boolean(v?.isFinalizableEarly);
}

function run() {
  const tests: TestCase[] = [
    // =========================================
    // NOT_STARTED: nunca liquida
    // =========================================
    {
      scenario: 'NOT_STARTED — SIM → PENDING',
      eventDetails: 'Sim',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 0,
      awayScoreFT: 0,
      status: MatchStatus.NOT_STARTED,
      expected: {
        result: Result.pending,
        shouldUpdate: false,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'NOT_STARTED — NÃO → PENDING',
      eventDetails: 'Não',
      homeScoreHT: 0,
      awayScoreHT: 0,
      homeScoreFT: 0,
      awayScoreFT: 0,
      status: MatchStatus.NOT_STARTED,
      expected: {
        result: Result.pending,
        shouldUpdate: false,
        isFinalizableEarly: false,
      },
    },

    // =========================================
    // Sem HT válido: pending
    // =========================================
    {
      scenario: 'LIVE — sem HT → PENDING',
      eventDetails: 'Sim',
      homeScoreHT: null,
      awayScoreHT: null,
      homeScoreFT: 0,
      awayScoreFT: 0,
      status: MatchStatus.FIRST_HALF,
      expected: {
        result: Result.pending,
        shouldUpdate: false,
        isFinalizableEarly: false,
      },
    },

    // =========================================
    // FINISHED: decisão final
    // =========================================
    {
      scenario: 'FINISHED — SIM — HT 1x1 e FT 2x2 → WIN',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 2,
      awayScoreFT: 2,
      status: MatchStatus.FINISHED,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario:
        'FINISHED — SIM — HT 1x0 e FT 2x1 → LOSE (não teve ambas no HT)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      status: MatchStatus.FINISHED,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario:
        'FINISHED — SIM — HT 1x1 e FT 2x1 → LOSE (não teve ambas no 2H)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 2,
      awayScoreFT: 1,
      status: MatchStatus.FINISHED,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'FINISHED — NÃO — HT 1x0 e FT 2x1 → WIN',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: 2,
      awayScoreFT: 1,
      status: MatchStatus.FINISHED,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario:
        'FINISHED — NÃO — HT 1x1 e FT 2x2 → LOSE (ambas nos dois tempos)',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 2,
      awayScoreFT: 2,
      status: MatchStatus.FINISHED,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // =========================================
    // HALF_TIME: early baseado no HT (definitivo)
    // =========================================
    {
      scenario:
        'HALF_TIME — SIM — HT 1x0 → EARLY LOSE (impossível cumprir ambos tempos)',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: null,
      awayScoreFT: null,
      status: MatchStatus.HALF_TIME,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario:
        'HALF_TIME — NÃO — HT 1x0 → EARLY WIN (impossível ocorrer ambos tempos)',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 0,
      homeScoreFT: null,
      awayScoreFT: null,
      status: MatchStatus.HALF_TIME,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // =========================================
    // LIVE (2º tempo): early quando irreversível
    // =========================================
    {
      scenario: 'SECOND_HALF — SIM — HT 1x1, 2H já teve ambas → EARLY WIN',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 2, // 2H: 1
      awayScoreFT: 2, // 2H: 1
      status: MatchStatus.SECOND_HALF,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'SECOND_HALF — NÃO — HT 1x1, 2H já teve ambas → EARLY LOSE',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 2,
      awayScoreFT: 2,
      status: MatchStatus.SECOND_HALF,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },

    // =========================================
    // LIVE: aposta viva (pending)
    // =========================================
    {
      scenario: 'SECOND_HALF — SIM — HT 1x1, 2H 0x0 até agora → PENDING',
      eventDetails: 'Sim',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 1, // 2H: 0
      awayScoreFT: 1, // 2H: 0
      status: MatchStatus.SECOND_HALF,
      expected: {
        result: Result.pending,
        shouldUpdate: false,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'SECOND_HALF — NÃO — HT 1x1, 2H 0x0 até agora → PENDING',
      eventDetails: 'Não',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 1,
      awayScoreFT: 1,
      status: MatchStatus.SECOND_HALF,
      expected: {
        result: Result.pending,
        shouldUpdate: false,
        isFinalizableEarly: false,
      },
    },

    // =========================================
    // Mercado inválido
    // =========================================
    {
      scenario: 'Mercado inválido → VOID',
      eventDetails: 'Talvez',
      homeScoreHT: 1,
      awayScoreHT: 1,
      homeScoreFT: 2,
      awayScoreFT: 2,
      status: MatchStatus.FINISHED,
      expected: {
        result: Result.void,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    const got = analyzeAmbasMarcamEmAmbosTempos(
      t.eventDetails,
      t.homeScoreHT,
      t.awayScoreHT,
      t.homeScoreFT,
      t.awayScoreFT,
      t.status,
    );

    const gotEarly = early(got);

    const ok =
      got.result === t.expected.result &&
      got.shouldUpdate === t.expected.shouldUpdate &&
      gotEarly === t.expected.isFinalizableEarly;

    if (ok) passed++;
    else failed++;

    console.log(
      `${ok ? '✅' : '❌'} ${t.scenario} → ${Result[got.result]} | shouldUpdate=${
        got.shouldUpdate
      } | early=${gotEarly} | status=${MatchStatus[t.status]}`,
    );

    if (!ok) {
      console.log(
        `   Esperado: ${Result[t.expected.result]} | shouldUpdate=${t.expected.shouldUpdate} | early=${t.expected.isFinalizableEarly}`,
      );
      console.log(
        `   Recebido:  ${Result[got.result]} | shouldUpdate=${got.shouldUpdate} | early=${gotEarly}`,
      );
      console.log(
        `   Details="${t.eventDetails}" HT=${t.homeScoreHT}-${t.awayScoreHT} FT=${t.homeScoreFT}-${t.awayScoreFT}`,
      );
    }
  }

  console.log(`\n📊 ${passed}/${tests.length} testes passaram`);
  if (failed > 0) console.log(`❌ ${failed} teste(s) falharam`);
}

run();
