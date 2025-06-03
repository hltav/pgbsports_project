import { z } from 'zod';

export const GoalsSchema = z.object({
  for: z.number(),
  against: z.number(),
});
export type Goals = z.infer<typeof GoalsSchema>;

export const RecordSchema = z.object({
  played: z.number(),
  win: z.number(),
  draw: z.number(),
  lose: z.number(),
  goals: GoalsSchema,
});
export type Record = z.infer<typeof RecordSchema>;

export const TeamSchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string(),
});
export type Team = z.infer<typeof TeamSchema>;

export const StandingSchema = z.object({
  rank: z.number(),
  team: TeamSchema,
  points: z.number(),
  goalsDiff: z.number(),
  group: z.string(),
  form: z.string(),
  status: z.string(),
  description: z.string(),
  all: RecordSchema,
  home: RecordSchema,
  away: RecordSchema,
  update: z.string(),
});
export type Standing = z.infer<typeof StandingSchema>;

export const LeagueSchema = z.object({
  id: z.number(),
  name: z.string(),
  country: z.string(),
  logo: z.string(),
  flag: z.string(),
  season: z.number(),
  standings: z.array(z.array(StandingSchema)),
});
export type League = z.infer<typeof LeagueSchema>;

export const StandingsResponseItemSchema = z.object({
  league: LeagueSchema,
});
export type StandingsResponseItem = z.infer<typeof StandingsResponseItemSchema>;

export const StandingsResponseSchema = z.object({
  get: z.literal('standings'),
  parameters: z.object({
    league: z.string(),
    season: z.string(),
    team: z.string(),
  }),
  errors: z.array(z.string()),
  results: z.number(),
  paging: z.object({
    current: z.number(),
    total: z.number(),
  }),
  response: z.array(StandingsResponseItemSchema),
});
export type StandingsResponse = z.infer<typeof StandingsResponseSchema>;
