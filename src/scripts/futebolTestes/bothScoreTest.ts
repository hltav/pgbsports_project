/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MatchStatus, Result } from '@prisma/client';
import { analyzeAmbasMarcam } from './../../shared/results/analysis';

type Expected = {
  result: Result;
  shouldUpdate: boolean;
  isFinalizableEarly: boolean;
};

type TestCase = {
  scenario: string;
  eventDetails: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  expected: Expected;
};

function normalizeEarly(v: any): boolean {
  return Boolean(v?.isFinalizableEarly);
}

function assertResult(test: TestCase) {
  const got = analyzeAmbasMarcam(
    test.eventDetails,
    test.homeScore,
    test.awayScore,
    test.status,
  );

  const gotEarly = normalizeEarly(got);

  const pass =
    got.result === test.expected.result &&
    got.shouldUpdate === test.expected.shouldUpdate &&
    gotEarly === test.expected.isFinalizableEarly;

  return { pass, got, gotEarly };
}

function run() {
  const tests: TestCase[] = [
    // =========================================================
    // NOT_STARTED: nunca liquida, mesmo que score venha 0-0
    // =========================================================
    {
      scenario: 'NOT_STARTED — BTTS SIM → PENDING',
      eventDetails: 'Ambos Marcam - Sim',
      homeScore: 0,
      awayScore: 0,
      status: MatchStatus.NOT_STARTED,
      expected: {
        result: Result.pending,
        shouldUpdate: false,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'NOT_STARTED — BTTS NÃO → PENDING',
      eventDetails: 'Ambos Marcam - Não',
      homeScore: 0,
      awayScore: 0,
      status: MatchStatus.NOT_STARTED,
      expected: {
        result: Result.pending,
        shouldUpdate: false,
        isFinalizableEarly: false,
      },
    },

    // =========================================================
    // BTTS simples: "Ambos Marcam - Sim"
    // =========================================================
    {
      scenario: 'LIVE — BTTS SIM — 1x1 → WIN early',
      eventDetails: 'Ambos Marcam - Sim',
      homeScore: 1,
      awayScore: 1,
      status: MatchStatus.FIRST_HALF,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'LIVE — BTTS SIM — 1x0 → PENDING (pode virar)',
      eventDetails: 'Ambos Marcam - Sim',
      homeScore: 1,
      awayScore: 0,
      status: MatchStatus.SECOND_HALF,
      expected: {
        result: Result.pending,
        shouldUpdate: false,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'FINISHED — BTTS SIM — 1x0 → LOSE',
      eventDetails: 'Ambos Marcam - Sim',
      homeScore: 1,
      awayScore: 0,
      status: MatchStatus.FINISHED,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // =========================================================
    // BTTS simples: "Ambos Marcam - Não" / "Nao"
    // =========================================================
    {
      scenario: 'LIVE — BTTS NÃO — 1x0 → PENDING (NÃO ganha antes de terminar)',
      eventDetails: 'Ambos Marcam - Não',
      homeScore: 1,
      awayScore: 0,
      status: MatchStatus.FIRST_HALF,
      expected: {
        result: Result.pending,
        shouldUpdate: false,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'LIVE — BTTS NÃO — 1x1 → LOSE early (ambos já marcaram)',
      eventDetails: 'Ambos Marcam - Não',
      homeScore: 1,
      awayScore: 1,
      status: MatchStatus.SECOND_HALF,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'FINISHED — BTTS NÃO — 1x0 → WIN',
      eventDetails: 'Ambos Marcam - Nao',
      homeScore: 1,
      awayScore: 0,
      status: MatchStatus.FINISHED,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // =========================================================
    // "Ambos marcam e + 2.5 gols - Sim/Não"
    // =========================================================
    {
      scenario: 'LIVE — AND+2.5 SIM — 2x1 (ambas e total>2.5) → WIN early',
      eventDetails: 'Ambos marcam e + 2.5 gols - Sim',
      homeScore: 2,
      awayScore: 1,
      status: MatchStatus.SECOND_HALF,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'LIVE — AND+2.5 SIM — 1x1 (ambas mas total=2) → PENDING',
      eventDetails: 'Ambos marcam e + 2.5 gols - Sim',
      homeScore: 1,
      awayScore: 1,
      status: MatchStatus.SECOND_HALF,
      expected: {
        result: Result.pending,
        shouldUpdate: false,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'FINISHED — AND+2.5 SIM — 1x1 → LOSE',
      eventDetails: 'Ambos marcam e + 2.5 gols - Sim',
      homeScore: 1,
      awayScore: 1,
      status: MatchStatus.FINISHED,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'LIVE — AND+2.5 NÃO — 2x1 (condição aconteceu) → LOSE early',
      eventDetails: 'Ambos marcam e + 2.5 gols - Não',
      homeScore: 2,
      awayScore: 1,
      status: MatchStatus.SECOND_HALF,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'FINISHED — AND+2.5 NÃO — 1x1 (condição NÃO aconteceu) → WIN',
      eventDetails: 'Ambos marcam e + 2.5 gols - Não',
      homeScore: 1,
      awayScore: 1,
      status: MatchStatus.FINISHED,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // =========================================================
    // "Ambos marcam ou + 2.5 gols - Sim/Não"
    // =========================================================
    {
      scenario: 'LIVE — OR+2.5 SIM — 1x1 → WIN early (ambas)',
      eventDetails: 'Ambos marcam ou + 2.5 gols - Sim',
      homeScore: 1,
      awayScore: 1,
      status: MatchStatus.FIRST_HALF,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'LIVE — OR+2.5 SIM — 3x0 → WIN early (total>2.5)',
      eventDetails: 'Ambos marcam ou + 2.5 gols - Sim',
      homeScore: 3,
      awayScore: 0,
      status: MatchStatus.FIRST_HALF,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'LIVE — OR+2.5 SIM — 1x0 → PENDING',
      eventDetails: 'Ambos marcam ou + 2.5 gols - Sim',
      homeScore: 1,
      awayScore: 0,
      status: MatchStatus.FIRST_HALF,
      expected: {
        result: Result.pending,
        shouldUpdate: false,
        isFinalizableEarly: false,
      },
    },
    {
      scenario: 'LIVE — OR+2.5 NÃO — 1x1 (condição aconteceu) → LOSE early',
      eventDetails: 'Ambos marcam ou + 2.5 gols - Não',
      homeScore: 1,
      awayScore: 1,
      status: MatchStatus.SECOND_HALF,
      expected: {
        result: Result.lose,
        shouldUpdate: true,
        isFinalizableEarly: true,
      },
    },
    {
      scenario: 'FINISHED — OR+2.5 NÃO — 1x0 (condição NÃO aconteceu) → WIN',
      eventDetails: 'Ambos marcam ou + 2.5 gols - Não',
      homeScore: 1,
      awayScore: 0,
      status: MatchStatus.FINISHED,
      expected: {
        result: Result.win,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },

    // =========================================================
    // Mercado inválido → VOID (depende do seu voidResult)
    // =========================================================
    {
      scenario: 'Mercado desconhecido → VOID',
      eventDetails: 'Ambas marcam ???',
      homeScore: 1,
      awayScore: 1,
      status: MatchStatus.FINISHED,
      expected: {
        result: Result.void,
        shouldUpdate: true,
        isFinalizableEarly: false,
      },
    },
  ];

  let passed = 0;

  for (const t of tests) {
    const { pass, got, gotEarly } = assertResult(t);

    if (pass) passed++;

    console.log(
      `${pass ? '✅' : '❌'} ${t.scenario} → ${Result[got.result]} | shouldUpdate=${
        got.shouldUpdate
      } | early=${gotEarly} | status=${MatchStatus[t.status]}`,
    );

    if (!pass) {
      console.log(
        `   Esperado: ${Result[t.expected.result]} | shouldUpdate=${t.expected.shouldUpdate} | early=${t.expected.isFinalizableEarly}`,
      );
      console.log(
        `   Recebido:  ${Result[got.result]} | shouldUpdate=${got.shouldUpdate} | early=${gotEarly}`,
      );
      console.log(
        `   Details: "${t.eventDetails}" score=${t.homeScore}-${t.awayScore}`,
      );
    }
  }

  console.log(`\n📊 ${passed}/${tests.length} testes passaram`);
}

run();
