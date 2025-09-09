import { z } from 'zod';

export const TeamsSeasonsResponseSchema = z.object({
  get: z.literal('teams/seasons'),
  parameters: z.object({
    team: z.string(),
  }),
  errors: z.array(z.string()),
  results: z.number(),
  paging: z.object({
    current: z.number(),
    total: z.number(),
  }),
  response: z.array(z.number()),
});
export type TeamsSeasonsResponse = z.infer<typeof TeamsSeasonsResponseSchema>;
