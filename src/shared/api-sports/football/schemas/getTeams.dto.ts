import { z } from 'zod';

export const GetTeamsSchema = z.object({
  league: z.coerce.number({
    required_error: 'League is required',
    invalid_type_error: 'League must be a number',
  }),
  season: z.coerce.number({
    required_error: 'Season is required',
    invalid_type_error: 'Season must be a number',
  }),
});

export type GetTeamsDto = z.infer<typeof GetTeamsSchema>;
