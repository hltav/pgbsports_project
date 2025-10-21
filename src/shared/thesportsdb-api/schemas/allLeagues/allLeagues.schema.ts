import { z } from 'zod';

export const LeagueSchema = z.object({
  idLeague: z.string(),
  strLeague: z.string(),
  strSport: z.string(),
  strLeagueAlternate: z.string().nullable().optional(),
});

export const AllLeaguesResponseSchema = z.object({
  all: z.array(LeagueSchema),
});

export type League = z.infer<typeof LeagueSchema>;
export type AllLeaguesResponse = z.infer<typeof AllLeaguesResponseSchema>;
