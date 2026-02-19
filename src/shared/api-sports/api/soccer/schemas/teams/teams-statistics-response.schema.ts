import { z } from 'zod';

// League info
export const LeagueSchema = z.object({
  id: z.number(),
  name: z.string(),
  country: z.string(),
  logo: z.string(),
  flag: z.string().nullable().optional(),
  season: z.number(),
});
export type League = z.infer<typeof LeagueSchema>;

// Team summary info (simplificado)
export const TeamBasicSchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string(),
});
export type TeamBasic = z.infer<typeof TeamBasicSchema>;

// Fixtures stats
export const FixturesStatSchema = z.object({
  home: z.number(),
  away: z.number(),
  total: z.number(),
});
export type FixturesStat = z.infer<typeof FixturesStatSchema>;

// Goals minute interval
export const MinuteIntervalSchema = z.object({
  total: z.number().nullable(),
  percentage: z.string().nullable(),
});
export type MinuteInterval = z.infer<typeof MinuteIntervalSchema>;

// Goals by minute intervals (as object with keys as strings)
export const GoalsMinuteSchema = z.object({
  '0-15': MinuteIntervalSchema,
  '16-30': MinuteIntervalSchema,
  '31-45': MinuteIntervalSchema,
  '46-60': MinuteIntervalSchema,
  '61-75': MinuteIntervalSchema,
  '76-90': MinuteIntervalSchema,
  '91-105': MinuteIntervalSchema,
  '106-120': MinuteIntervalSchema,
});
export type GoalsMinute = z.infer<typeof GoalsMinuteSchema>;

// Goals total and average
export const GoalsTotalAverageSchema = z.object({
  home: z.number(),
  away: z.number(),
  total: z.number(),
});
export type GoalsTotalAverage = z.infer<typeof GoalsTotalAverageSchema>;

export const GoalsAverageSchema = z.object({
  home: z.string(),
  away: z.string(),
  total: z.string(),
});
export type GoalsAverage = z.infer<typeof GoalsAverageSchema>;

// Goals for or against structure
export const GoalsForAgainstSchema = z.object({
  total: GoalsTotalAverageSchema,
  average: GoalsAverageSchema,
  minute: GoalsMinuteSchema,
});
export type GoalsForAgainst = z.infer<typeof GoalsForAgainstSchema>;

// Under/Over object per threshold
export const UnderOverThresholdSchema = z.object({
  over: z.number(),
  under: z.number(),
});
export type UnderOverThreshold = z.infer<typeof UnderOverThresholdSchema>;

// Under/Over grouping
export const UnderOverSchema = z.object({
  '0.5': UnderOverThresholdSchema,
  '1.5': UnderOverThresholdSchema,
  '2.5': UnderOverThresholdSchema,
  '3.5': UnderOverThresholdSchema,
  '4.5': UnderOverThresholdSchema,
});
export type UnderOver = z.infer<typeof UnderOverSchema>;

// Goals schema with under_over
export const GoalsSchema = z.object({
  for: GoalsForAgainstSchema.extend({
    under_over: UnderOverSchema,
  }),
  against: GoalsForAgainstSchema.extend({
    under_over: UnderOverSchema,
  }),
});
export type Goals = z.infer<typeof GoalsSchema>;

// Fixtures grouping: played, wins, draws, loses
export const FixturesGroupingSchema = z.object({
  played: FixturesStatSchema,
  wins: FixturesStatSchema,
  draws: FixturesStatSchema,
  loses: FixturesStatSchema,
});
export type FixturesGrouping = z.infer<typeof FixturesGroupingSchema>;

// Biggest streaks
export const StreakSchema = z.object({
  wins: z.number(),
  draws: z.number(),
  loses: z.number(),
});
export type Streak = z.infer<typeof StreakSchema>;

// Biggest wins/loses scorelines
export const WinsLosesScoreSchema = z.object({
  home: z.string(),
  away: z.string(),
});
export type WinsLosesScore = z.infer<typeof WinsLosesScoreSchema>;

// Biggest goals
export const BiggestGoalsSchema = z.object({
  for: z.object({
    home: z.number(),
    away: z.number(),
  }),
  against: z.object({
    home: z.number(),
    away: z.number(),
  }),
});
export type BiggestGoals = z.infer<typeof BiggestGoalsSchema>;

// Biggest grouping
export const BiggestSchema = z.object({
  streak: StreakSchema,
  wins: WinsLosesScoreSchema,
  loses: WinsLosesScoreSchema,
  goals: BiggestGoalsSchema,
});
export type Biggest = z.infer<typeof BiggestSchema>;

// Penalty schema
export const PenaltyDetailSchema = z.object({
  total: z.number(),
  percentage: z.string(),
});
export type PenaltyDetail = z.infer<typeof PenaltyDetailSchema>;

export const PenaltySchema = z.object({
  scored: PenaltyDetailSchema,
  missed: PenaltyDetailSchema,
  total: z.number(),
});
export type Penalty = z.infer<typeof PenaltySchema>;

// Lineup schema
export const LineupSchema = z.object({
  formation: z.string(),
  played: z.number(),
});
export type Lineup = z.infer<typeof LineupSchema>;

// Card minute interval (yellow/red cards)
export const CardMinuteIntervalSchema = z.object({
  total: z.number().nullable(),
  percentage: z.string().nullable(),
});
export type CardMinuteInterval = z.infer<typeof CardMinuteIntervalSchema>;

// Cards yellow/red grouping
export const CardsColorSchema = z.object({
  '0-15': CardMinuteIntervalSchema,
  '16-30': CardMinuteIntervalSchema,
  '31-45': CardMinuteIntervalSchema,
  '46-60': CardMinuteIntervalSchema,
  '61-75': CardMinuteIntervalSchema,
  '76-90': CardMinuteIntervalSchema,
  '91-105': CardMinuteIntervalSchema,
  '106-120': CardMinuteIntervalSchema,
});
export type CardsColor = z.infer<typeof CardsColorSchema>;

// Cards schema
export const CardsSchema = z.object({
  yellow: CardsColorSchema,
  red: CardsColorSchema,
});
export type Cards = z.infer<typeof CardsSchema>;

// Full response schema
export const TeamsStatisticsResponseSchema = z.object({
  get: z.literal('teams/statistics'),
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
  response: z.object({
    league: LeagueSchema,
    team: TeamBasicSchema,
    form: z.string(),
    fixtures: FixturesGroupingSchema,
    goals: GoalsSchema,
    biggest: BiggestSchema,
    clean_sheet: FixturesStatSchema,
    failed_to_score: FixturesStatSchema,
    penalty: PenaltySchema,
    lineups: z.array(LineupSchema),
    cards: CardsSchema,
  }),
});
export type TeamsStatisticsResponse = z.infer<
  typeof TeamsStatisticsResponseSchema
>;
