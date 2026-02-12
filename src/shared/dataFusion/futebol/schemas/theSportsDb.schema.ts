import { SafeInfer } from './../../../../types/zod';
import { z } from 'zod';

export const TheSportsDbEventSchema = z.object({
  idEvent: z.string(),
  strEvent: z.string(),
  strFilename: z.string().nullable().optional(),
  strSport: z.string(),
  idLeague: z.string(),
  strLeague: z.string(),
  strLeagueBadge: z
    .preprocess(
      (val) => (typeof val === 'string' && val.trim() ? val : null),
      z.string().url().nullable(),
    )
    .optional(),
  strHomeTeam: z.string(),
  strAwayTeam: z.string(),
  intHomeScore: z.string().nullable().optional(),
  intAwayScore: z.string().nullable().optional(),
  intRound: z.string().nullable().optional(),
  strTimestamp: z.string().nullable().optional(),
  dateEvent: z.string().nullable().optional(),
  dateEventLocal: z.string().nullable().optional(),
  strTime: z.string().nullable().optional(),
  strTimeLocal: z.string().nullable().optional(),
  idHomeTeam: z.string().nullable().optional(),
  idAwayTeam: z.string().nullable().optional(),
  strHomeTeamBadge: z.string().nullable().optional(),
  strAwayTeamBadge: z.string().nullable().optional(),
  strVenue: z.string().nullable().optional(),
  strCountry: z.string().nullable().optional(),
  strPoster: z.string().nullable().optional(),
  strThumb: z.string().nullable().optional(),
  strVideo: z.string().nullable().optional(),
  strStatus: z.string().nullable().optional(),
  strPostponed: z.string().nullable().optional(),
});

// Use 'events' ao invés de 'lookup'
export const TheSportsDbEventsResponseSchema = z.object({
  events: z.array(TheSportsDbEventSchema).nullable(),
});

export type TheSportsDbEvent = SafeInfer<typeof TheSportsDbEventSchema>;
export type TheSportsDbEventsResponse = SafeInfer<
  typeof TheSportsDbEventsResponseSchema
>;
