import { z } from 'zod';
import { ApiSportsFixtureSchema } from './apiSportsFixture.scheme';

export const ApiSportsFixturesResponseSchema = z.object({
  get: z.literal('fixtures'),

  parameters: z.object({
    league: z.string(),
    season: z.string().optional(),
    next: z.string().optional(),
  }),

  errors: z.array(z.unknown()),

  results: z.number(),

  paging: z.object({
    current: z.number(),
    total: z.number(),
  }),

  response: z.array(ApiSportsFixtureSchema),
});

export type ApiSportsFixturesResponse = z.infer<
  typeof ApiSportsFixturesResponseSchema
>;
