import { z } from 'zod';

export const GetFixturesSchema = z.object({
  league: z.coerce.number(),
  season: z.coerce.number().optional(),
  next: z.coerce.number().optional(),
});

export type GetFixturesDto = z.infer<typeof GetFixturesSchema>;
