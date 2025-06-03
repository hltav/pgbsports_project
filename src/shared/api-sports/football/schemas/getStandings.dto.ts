import { z } from 'zod';

export const GetStandingsSchema = z.object({
  league: z.coerce.number({
    required_error: 'League is required',
    invalid_type_error: 'League must be a number',
  }),
  season: z.coerce.number({
    required_error: 'Season is required',
    invalid_type_error: 'Season must be a number',
  }),
});

export type GetStandingsDto = z.infer<typeof GetStandingsSchema>;
