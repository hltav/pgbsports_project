import { z } from 'zod';

export const DiscoverFixtureSchema = z.object({
  previewId: z.string(),
  apiSportsEventId: z.number().optional().nullable(),
  tsdbEventId: z.string().optional().nullable(),
  league: z.object({
    id: z.number(),
    name: z.string(),
    flag: z.string().nullable().optional(),
    logo: z.string().nullable().optional(),
  }),
  season: z.number().optional().nullable(),
  isCurrentSeason: z.boolean().optional(),
  date: z.string(),
  status: z.string(),

  teams: z.object({
    home: z.object({
      name: z.string(),
      logo: z.string().optional(),
    }),
    away: z.object({
      name: z.string(),
      logo: z.string().optional(),
    }),
  }),

  sources: z.object({
    apiSports: z.boolean(),
    theSportsDb: z.boolean(),
  }),

  confidence: z.number().min(0).max(1),
  canRegister: z.boolean(),
  sourcePriority: z.enum(['BOTH', 'API_SPORTS', 'TSDB', 'NONE']).optional(),
});

export type DiscoverFixture = z.infer<typeof DiscoverFixtureSchema>;
