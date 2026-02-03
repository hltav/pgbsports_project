import { z } from 'zod';

export const LeagueSchema = z.object({
  idLeague: z.string(),
  strLeague: z.string(),
  strSport: z.string(),
  strLeagueAlternate: z.string().nullable().optional(),
  strBadge: z.string().nullable().optional(),
  strLogo: z.string().url().optional().or(z.literal('')),
  strBanner: z.string().url().optional().or(z.literal('')),
  strCurrentSeason: z.string().url().optional().or(z.literal('')),
  strCountry: z.string().nullable().optional(),
});

export const AllLeaguesResponseSchema = z.object({
  all: z.array(LeagueSchema),
});

export const LookupLeagueResponseSchema = z.object({
  lookup: z.array(LeagueSchema).nullable(),
});

export type League = z.infer<typeof LeagueSchema>;
export type AllLeaguesResponse = z.infer<typeof AllLeaguesResponseSchema>;
export type LookupLeagueResponse = z.infer<typeof LookupLeagueResponseSchema>;
