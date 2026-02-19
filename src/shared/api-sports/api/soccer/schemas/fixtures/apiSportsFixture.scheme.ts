import { z } from 'zod';

export const ApiSportsFixtureSchema = z.object({
  fixture: z.object({
    id: z.number(),
    referee: z.string().nullable(),
    timezone: z.string(),
    date: z.string(), // ISO string
    timestamp: z.number(),
    periods: z.object({
      first: z.number().nullable(),
      second: z.number().nullable(),
    }),
    venue: z.object({
      id: z.number().nullable(),
      name: z.string().nullable(),
      city: z.string().nullable(),
    }),
    status: z.object({
      long: z.string(),
      short: z.string(),
      elapsed: z.number().nullable(),
      extra: z.number().nullable(),
    }),
  }),

  league: z.object({
    id: z.number(),
    name: z.string(),
    country: z.string(),
    logo: z.string(),
    flag: z.string().nullable().optional(),
    season: z.number(),
    round: z.string(),
    standings: z.boolean(),
  }),

  teams: z.object({
    home: z.object({
      id: z.number(),
      name: z.string(),
      logo: z.string(),
      winner: z.boolean().nullable(),
    }),
    away: z.object({
      id: z.number(),
      name: z.string(),
      logo: z.string(),
      winner: z.boolean().nullable(),
    }),
  }),

  goals: z.object({
    home: z.number().nullable(),
    away: z.number().nullable(),
  }),

  score: z.object({
    halftime: z.object({
      home: z.number().nullable(),
      away: z.number().nullable(),
    }),
    fulltime: z.object({
      home: z.number().nullable(),
      away: z.number().nullable(),
    }),
    extratime: z.object({
      home: z.number().nullable(),
      away: z.number().nullable(),
    }),
    penalty: z.object({
      home: z.number().nullable(),
      away: z.number().nullable(),
    }),
  }),
});
export type ApiSportsFixture = z.infer<typeof ApiSportsFixtureSchema>;
