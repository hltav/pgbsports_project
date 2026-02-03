import { z } from 'zod';

// Coverage de fixtures
export const CoverageFixturesSchema = z.object({
  events: z.boolean(),
  lineups: z.boolean(),
  statistics_fixtures: z.boolean(),
  statistics_players: z.boolean(),
});
export type CoverageFixtures = z.infer<typeof CoverageFixturesSchema>;

// Coverage geral
export const CoverageSchema = z.object({
  fixtures: CoverageFixturesSchema,
  standings: z.boolean(),
  players: z.boolean(),
  top_scorers: z.boolean(),
  top_assists: z.boolean(),
  top_cards: z.boolean(),
  injuries: z.boolean(),
  predictions: z.boolean(),
  odds: z.boolean(),
});
export type Coverage = z.infer<typeof CoverageSchema>;

// Seasons
export const SeasonSchema = z.object({
  year: z.number(),
  start: z.string(),
  end: z.string(),
  current: z.boolean(),
  coverage: CoverageSchema,
});
export type Season = z.infer<typeof SeasonSchema>;

// Country
export const CountrySchema = z.object({
  name: z.string(),
  code: z.string().nullable(),
  flag: z.string().nullable(),
});
export type Country = z.infer<typeof CountrySchema>;

// League info
export const LeagueInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  logo: z.string(),
});
export type LeagueInfo = z.infer<typeof LeagueInfoSchema>;

// Item do array response da API leagues
export const LeagueResponseItemSchema = z.object({
  league: LeagueInfoSchema,
  country: CountrySchema,
  seasons: z.array(SeasonSchema),
  highlighted: z.boolean(),
});
export type LeagueResponseItem = z.infer<typeof LeagueResponseItemSchema>;

// Schema completo da resposta leagues
export const LeaguesResponseSchema = z.object({
  get: z.literal('leagues'),
  parameters: z.array(z.unknown()),
  errors: z.array(z.string()),
  results: z.number(),
  paging: z.object({
    current: z.number(),
    total: z.number(),
  }),
  response: z.array(LeagueResponseItemSchema),
});
export type LeaguesResponse = z.infer<typeof LeaguesResponseSchema>;
