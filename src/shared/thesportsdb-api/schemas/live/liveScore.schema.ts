import { z } from 'zod';

export const LiveScoreEventSchema = z.object({
  idLiveScore: z.string(),
  idEvent: z.string(),
  strSport: z.string(),
  idLeague: z.string(),
  strLeague: z.string(),
  idHomeTeam: z.string(),
  idAwayTeam: z.string(),
  strHomeTeam: z.string(),
  strAwayTeam: z.string(),
  strHomeTeamBadge: z.string(),
  strAwayTeamBadge: z.string(),
  intHomeScore: z.string(),
  intAwayScore: z.string(),
  intEventScore: z.string().nullable(),
  intEventScoreTotal: z.string().nullable(),
  strStatus: z.string(),
  strProgress: z.string(),
  strEventTime: z.string(),
  dateEvent: z.string().nullable(),
  createdAt: z.string(),
  updated: z.string(),
});

export type LiveScoreEvent = z.infer<typeof LiveScoreEventSchema>;

// Simples parse
export const parseLiveScores = (raw: unknown[]): LiveScoreEvent[] =>
  raw.map((item) => LiveScoreEventSchema.parse(item));
