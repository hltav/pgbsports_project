import { z } from 'zod';

// PredictionWinner

export const PredictionWinnerSchema = z.object({
  id: z.number(),
  name: z.string(),
  comment: z.string(),
});
export type PredictionWinner = z.infer<typeof PredictionWinnerSchema>;

// PredictionGoals

export const PredictionGoalsSchema = z.object({
  home: z.string(),
  away: z.string(),
});
export type PredictionGoals = z.infer<typeof PredictionGoalsSchema>;

// PredictionPercent

export const PredictionPercentSchema = z.object({
  home: z.string(),
  draw: z.string(),
  away: z.string(),
});
export type PredictionPercent = z.infer<typeof PredictionPercentSchema>;

// Prediction

export const PredictionSchema = z.object({
  winner: PredictionWinnerSchema,
  win_or_draw: z.boolean(),
  under_over: z.string().nullable(),
  goals: PredictionGoalsSchema,
  advice: z.string(),
  percent: PredictionPercentSchema,
});
export type Prediction = z.infer<typeof PredictionSchema>;

// League

export const LeagueSchema = z.object({
  id: z.number(),
  name: z.string(),
  country: z.string(),
  logo: z.string(),
  flag: z.string().nullable().optional(),
  season: z.number(),
});
export type League = z.infer<typeof LeagueSchema>;

// PredictionTeam

export const PredictionTeamSchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string(),
  last_5: z.object({}).passthrough(),
  league: z.object({}).passthrough(),
  biggest: z.object({}).passthrough(),
  clean_sheet: z.object({}).passthrough(),
  failed_to_score: z.object({}).passthrough(),
  penalty: z.object({}).passthrough(),
  lineups: z.array(z.object({}).passthrough()),
  cards: z.object({}).passthrough(),
});
export type PredictionTeam = z.infer<typeof PredictionTeamSchema>;

// PredictionTeams

export const PredictionTeamsSchema = z.object({
  home: PredictionTeamSchema,
  away: PredictionTeamSchema,
});
export type PredictionTeams = z.infer<typeof PredictionTeamsSchema>;

// Comparison

export const ComparisonSchema = z.object({
  form: z.record(z.string()),
  att: z.record(z.string()),
  def: z.record(z.string()),
  poisson_distribution: z.record(z.string()),
  h2h: z.record(z.string()),
  goals: z.record(z.string()),
  total: z.record(z.string()),
});
export type Comparison = z.infer<typeof ComparisonSchema>;

// PredictionResponseItem

export const PredictionResponseItemSchema = z.object({
  predictions: PredictionSchema,
  league: LeagueSchema,
  teams: PredictionTeamsSchema,
  comparison: ComparisonSchema,
  h2h: z.array(z.object({}).passthrough()),
});
export type PredictionResponseItem = z.infer<
  typeof PredictionResponseItemSchema
>;

// PredictionApiResponse

export const PredictionApiResponseSchema = z.object({
  get: z.literal('predictions'),
  parameters: z.object({}).passthrough(),
  errors: z.array(z.string()),
  results: z.number(),
  paging: z.object({
    current: z.number(),
    total: z.number(),
  }),
  response: z.array(PredictionResponseItemSchema),
});
export type PredictionApiResponse = z.infer<typeof PredictionApiResponseSchema>;
