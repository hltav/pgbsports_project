import { z } from 'zod';
import { mapStrStatusToMatchStatus } from '../../helpers/mapStatusToEvent.helper';

export const NextEventSchema = z.object({
  idEvent: z.string(),
  idAPIfootball: z.string().nullable().optional(),
  strEvent: z.string(),
  strEventAlternate: z.string().nullable().optional(),
  strFilename: z.string().optional(),
  strSport: z.string(),
  idLeague: z.string(),
  strLeague: z.string(),
  strLeagueBadge: z
    .preprocess(
      (val) => (typeof val === 'string' && val.trim() ? val : null),
      z.string().url().nullable(),
    )
    .optional(),
  strSeason: z.string().nullable().optional(),
  strDescriptionEN: z.string().nullable().optional(),
  strHomeTeam: z.string().nullable().optional(),
  strAwayTeam: z.string().nullable().optional(),
  intHomeScore: z
    .preprocess(
      (val) => (val !== null && val !== undefined ? Number(val) : null),
      z.number().nullable(),
    )
    .optional(),
  intAwayScore: z
    .preprocess(
      (val) => (val !== null && val !== undefined ? Number(val) : null),
      z.number().nullable(),
    )
    .optional(),
  intRound: z.string().nullable().optional(),
  intSpectators: z
    .preprocess(
      (val) => (val !== null && val !== undefined ? Number(val) : null),
      z.number().nullable(),
    )
    .optional(),
  strOfficial: z.string().nullable().optional(),
  strTimestamp: z.string().nullable().optional(),
  dateEvent: z.string().nullable().optional(),
  dateEventLocal: z.string().nullable().optional(),
  strTime: z.string().nullable().optional(),
  strTimeLocal: z.string().nullable().optional(),
  strGroup: z.string().nullable().optional(),
  idHomeTeam: z.string().nullable().optional(),
  idAwayTeam: z.string().nullable().optional(),
  strHomeTeamBadge: z
    .preprocess(
      (val) => (typeof val === 'string' && val.trim() ? val : null),
      z.string().url().nullable(),
    )
    .optional(),
  strAwayTeamBadge: z
    .preprocess(
      (val) => (typeof val === 'string' && val.trim() ? val : null),
      z.string().url().nullable(),
    )
    .optional(),
  idVenue: z.string().nullable().optional(),
  strVenue: z.string().nullable().optional(),
  strCountry: z.string().nullable().optional(),
  strCity: z.string().nullable().optional(),
  strPoster: z
    .preprocess(
      (val) => (typeof val === 'string' && val.trim() ? val : null),
      z.string().url().nullable(),
    )
    .optional(),
  strSquare: z
    .preprocess(
      (val) => (typeof val === 'string' && val.trim() ? val : null),
      z.string().url().nullable(),
    )
    .optional(),
  strFanart: z
    .preprocess(
      (val) => (typeof val === 'string' && val.trim() ? val : null),
      z.string().url().nullable(),
    )
    .optional(),
  strThumb: z
    .preprocess(
      (val) => (typeof val === 'string' && val.trim() ? val : null),
      z.string().url().nullable(),
    )
    .optional(),
  strBanner: z
    .preprocess(
      (val) => (typeof val === 'string' && val.trim() ? val : null),
      z.string().url().nullable(),
    )
    .optional(),
  strMap: z
    .preprocess(
      (val) => (typeof val === 'string' && val.trim() ? val : null),
      z.string().url().nullable(),
    )
    .optional(),
  strTweet1: z.string().nullable().optional(),
  strTweet2: z.string().nullable().optional(),
  strTweet3: z.string().nullable().optional(),
  strVideo: z
    .preprocess(
      (val) => (typeof val === 'string' && val.trim() ? val : null),
      z.string().url().nullable(),
    )
    .optional(),
  strStatus: z.string().nullish().transform(mapStrStatusToMatchStatus),
  strPostponed: z.string().nullable().optional(),
  strLocked: z.string().nullable().optional(),
});

export const NextEventsResponseSchema = z.object({
  schedule: z.array(NextEventSchema),
});

export type NextEvent = z.infer<typeof NextEventSchema>;
export type NextEventsResponse = z.infer<typeof NextEventsResponseSchema>;
