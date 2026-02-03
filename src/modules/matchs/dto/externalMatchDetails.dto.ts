import { SafeInfer } from '../../../types/zod';
import z from 'zod';

// === API-Sports Fixture Response (completo) ===
export const ApiSportsFixtureResponseSchema = z.object({
  fixture: z.object({
    id: z.number().int(),
    referee: z.string().nullable(),
    timezone: z.string(),
    date: z.string(),
    timestamp: z.number().int(),
    periods: z.object({
      first: z.number().int().nullable(),
      second: z.number().int().nullable(),
    }),
    venue: z.object({
      id: z.number().int().nullable(),
      name: z.string().nullable(),
      city: z.string().nullable(),
    }),
    status: z.object({
      long: z.string(),
      short: z.string(),
      elapsed: z.number().int().nullable(),
      extra: z.number().int().nullable(),
    }),
  }),
  league: z.object({
    id: z.number().int(),
    name: z.string(),
    country: z.string(),
    logo: z.string(),
    flag: z.string(),
    season: z.number().int(),
    round: z.string(),
    standings: z.boolean().optional(),
  }),
  teams: z.object({
    home: z.object({
      id: z.number().int(),
      name: z.string(),
      logo: z.string(),
      winner: z.boolean().nullable(),
    }),
    away: z.object({
      id: z.number().int(),
      name: z.string(),
      logo: z.string(),
      winner: z.boolean().nullable(),
    }),
  }),
  goals: z.object({
    home: z.number().int().nullable(),
    away: z.number().int().nullable(),
  }),
  score: z.object({
    halftime: z.object({
      home: z.number().int().nullable(),
      away: z.number().int().nullable(),
    }),
    fulltime: z.object({
      home: z.number().int().nullable(),
      away: z.number().int().nullable(),
    }),
    extratime: z
      .object({
        home: z.number().int().nullable(),
        away: z.number().int().nullable(),
      })
      .nullable(),
    penalty: z
      .object({
        home: z.number().int().nullable(),
        away: z.number().int().nullable(),
      })
      .nullable(),
  }),
  events: z.array(z.any()),
  lineups: z.array(z.any()),
  statistics: z.array(z.any()),
  players: z.array(z.any()),
});

export type ApiSportsFixtureResponse = SafeInfer<
  typeof ApiSportsFixtureResponseSchema
>;

// === MatchEvent ===
export const MatchEventSchema = z.object({
  id: z.number().int().positive().optional(), // opcional para criação
  externalMatchId: z.number().int().positive(),
  teamId: z.number().int(),
  teamName: z.string().trim().max(100),
  minute: z.number().int(),
  extraMinute: z.number().int().optional().nullable(),
  eventType: z.string().trim().max(50),
  detail: z.string().trim().max(100).optional().nullable(),
  playerId: z.number().int().nullable(),
  playerName: z.string().trim().max(100).optional().nullable(),
  assistId: z.string().trim().max(50).optional().nullable(),
  assistName: z.string().trim().max(100).optional().nullable(),
  comments: z.string().optional().nullable(),
  createdAt: z.date().optional(), // opcional para criação
});

export type MatchEventDTO = SafeInfer<typeof MatchEventSchema>;

// === MatchLineup ===
export const MatchLineupSchema = z.object({
  id: z.number().int().positive().optional(),
  externalMatchId: z.number().int().positive(),
  teamId: z.number().int(),
  teamName: z.string().trim().max(100),
  formation: z.string().trim().max(10).optional().nullable(),
  coachId: z.string().trim().max(50).optional().nullable(),
  coachName: z.string().trim().max(100).optional().nullable(),
  coachPhoto: z.string().trim().max(255).optional().nullable(), // removido url() por causa de erros
  startingXI: z.any(),
  substitutes: z.any(),
  createdAt: z.date().optional(),
});

export type MatchLineupDTO = SafeInfer<typeof MatchLineupSchema>;

// === MatchStatistic ===
export const MatchStatisticSchema = z.object({
  id: z.number().int().positive().optional(),
  externalMatchId: z.number().int().positive(),
  teamId: z.number().int(),
  teamName: z.string().trim().max(100),
  period: z.string().default('FULL_TIME'),
  shotsTotal: z.number().int().optional().nullable(),
  shotsOnGoal: z.number().int().optional().nullable(),
  shotsOffGoal: z.number().int().optional().nullable(),
  shotsBlocked: z.number().int().optional().nullable(),
  shotsInsideBox: z.number().int().optional().nullable(),
  shotsOutsideBox: z.number().int().optional().nullable(),
  possession: z.number().int().optional().nullable(),
  passesTotal: z.number().int().optional().nullable(),
  passesAccurate: z.number().int().optional().nullable(),
  passesPercentage: z.number().int().optional().nullable(),
  corners: z.number().int().optional().nullable(),
  offsides: z.number().int().optional().nullable(),
  fouls: z.number().int().optional().nullable(),
  yellowCards: z.number().int().optional().nullable(),
  redCards: z.number().int().optional().nullable(),
  goalkeeperSaves: z.number().int().optional().nullable(),
  expectedGoals: z.number().optional().nullable(),
  goalsPrevented: z.number().optional().nullable(),
  createdAt: z.date().optional(),
});

export type MatchStatisticDTO = SafeInfer<typeof MatchStatisticSchema>;

// === PlayerMatchStat ===
export const PlayerMatchStatSchema = z.object({
  id: z.number().int().positive().optional(),
  externalMatchId: z.number().int().positive(),
  playerId: z.number().int().nullable(),
  playerName: z.string().trim().max(100),
  playerPhoto: z.string().trim().max(255).optional().nullable(),
  teamId: z.number().int(),
  position: z.string().trim().max(10).optional().nullable(),
  number: z.number().int().optional().nullable(),
  minutesPlayed: z.number().int().optional().nullable(),
  rating: z.number().optional().nullable(),
  isCaptain: z.boolean().default(false),
  isSubstitute: z.boolean().default(false),
  goals: z.number().int().optional().nullable(),
  assists: z.number().int().optional().nullable(),
  shotsTotal: z.number().int().optional().nullable(),
  shotsOnGoal: z.number().int().optional().nullable(),
  passesTotal: z.number().int().optional().nullable(),
  passesAccurate: z.number().int().optional().nullable(),
  passesKey: z.number().int().optional().nullable(),
  tackles: z.number().int().optional().nullable(),
  blocks: z.number().int().optional().nullable(),
  interceptions: z.number().int().optional().nullable(),
  duelsTotal: z.number().int().optional().nullable(),
  duelsWon: z.number().int().optional().nullable(),
  dribblesAttempts: z.number().int().optional().nullable(),
  dribblesSuccess: z.number().int().optional().nullable(),
  dribblesPast: z.number().int().optional().nullable(),
  foulsDrawn: z.number().int().optional().nullable(),
  foulsCommitted: z.number().int().optional().nullable(),
  yellowCards: z.number().int().optional().nullable(),
  redCards: z.number().int().optional().nullable(),
  saves: z.number().int().optional().nullable(),
  goalsConceded: z.number().int().optional().nullable(),
  createdAt: z.date().optional(),
});

export type PlayerMatchStatDTO = SafeInfer<typeof PlayerMatchStatSchema>;

// === ExternalMatchDetails ===
export const ExternalMatchDetailsSchema = z.object({
  id: z.number().int().positive().optional(), // ✅ não é obrigatório em create
  externalMatchId: z.number().int().positive(),

  referee: z.string().trim().max(100).nullable().optional(),
  venueId: z.number().int().nullable().optional(),
  venueName: z.string().trim().max(200).nullable().optional(),
  venueCity: z.string().trim().max(100).nullable().optional(),

  homeTeamId: z.number().int(),
  awayTeamId: z.number().int(),
  homeWinner: z.boolean().nullable().optional(),
  awayWinner: z.boolean().nullable().optional(),

  fixtureTimestamp: z.bigint(), // ✅ Prisma BigInt
  periodsFirst: z.bigint().nullable().optional(),
  periodsSecond: z.bigint().nullable().optional(),

  statusLong: z.string().trim().max(50).nullable().optional(),
  statusShort: z.string().trim().max(20).nullable().optional(),
  statusElapsed: z.number().int().nullable().optional(),
  statusExtra: z.number().int().nullable().optional(),

  // ✅ Json?
  events: z.unknown().nullable().optional(),
  lineups: z.unknown().nullable().optional(),
  players: z.unknown().nullable().optional(),
  statisticsTotal: z.unknown().nullable().optional(),
  statisticsFirstHalf: z.unknown().nullable().optional(),
  statisticsSecondHalf: z.unknown().nullable().optional(),
  rawApiResponse: z.unknown().nullable().optional(),

  // você pode omitir em create porque tem default no banco,
  // mas pode preencher também se quiser
  lastApiSyncAt: z.date().optional(),
  dataHash: z.string().trim().max(100).nullable().optional(),
});

export type ExternalMatchDetailsDTO = SafeInfer<
  typeof ExternalMatchDetailsSchema
>;
