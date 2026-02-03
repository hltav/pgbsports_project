import { z } from 'zod';

export const VenueSchema = z.object({
  id: z.number(),
  name: z.string(),
  city: z.string(),
});
export type Venue = z.infer<typeof VenueSchema>;

export const PeriodsSchema = z.object({
  first: z.number(),
  second: z.number().nullable(),
});
export type Periods = z.infer<typeof PeriodsSchema>;

export const StatusSchema = z.object({
  long: z.string(),
  short: z.string(),
  elapsed: z.number(),
  extra: z.nullable(z.any()),
});
export type Status = z.infer<typeof StatusSchema>;

export const FixtureSchema = z.object({
  id: z.number(),
  referee: z.string(),
  timezone: z.string(),
  date: z.string(),
  timestamp: z.number(),
  periods: PeriodsSchema,
  venue: VenueSchema,
  status: StatusSchema,
});
export type Fixture = z.infer<typeof FixtureSchema>;

export const LeagueSchema = z.object({
  id: z.number(),
  name: z.string(),
  country: z.string(),
  logo: z.string(),
  flag: z.string(),
  season: z.number(),
  round: z.string(),
  standings: z.boolean(),
});
export type League = z.infer<typeof LeagueSchema>;

export const TeamInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string(),
  winner: z.boolean().nullable(),
});
export type TeamInfo = z.infer<typeof TeamInfoSchema>;

export const TeamsSchema = z.object({
  home: TeamInfoSchema,
  away: TeamInfoSchema,
});
export type Teams = z.infer<typeof TeamsSchema>;

export const GoalsSchema = z.object({
  home: z.number(),
  away: z.number(),
});
export type Goals = z.infer<typeof GoalsSchema>;

export const ScoreDetailsSchema = z.object({
  home: z.number().nullable(),
  away: z.number().nullable(),
});
export type ScoreDetails = z.infer<typeof ScoreDetailsSchema>;

export const ScoreSchema = z.object({
  halftime: ScoreDetailsSchema,
  fulltime: ScoreDetailsSchema,
  extratime: ScoreDetailsSchema,
  penalty: ScoreDetailsSchema,
});
export type Score = z.infer<typeof ScoreSchema>;

export const FixtureResponseItemSchema = z.object({
  fixture: FixtureSchema,
  league: LeagueSchema,
  teams: TeamsSchema,
  goals: GoalsSchema,
  score: ScoreSchema,
});
export type FixtureResponseItem = z.infer<typeof FixtureResponseItemSchema>;

export const FixturesResponseSchema = z.object({
  get: z.literal('fixtures'),
  parameters: z.object({
    date: z.string(),
  }),
  errors: z.array(z.string()),
  results: z.number(),
  paging: z.object({
    current: z.number(),
    total: z.number(),
  }),
  response: z.array(FixtureResponseItemSchema),
});
export type FixturesResponse = z.infer<typeof FixturesResponseSchema>;
