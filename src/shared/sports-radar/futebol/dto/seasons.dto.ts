import { z } from 'zod';

export const SeasonSchema = z.object({
  id: z.string(),
  name: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  year: z.string(),
  competition_id: z.string(),
});

export const SeasonsResponseSchema = z.object({
  generated_at: z.string(),
  seasons: z.array(SeasonSchema),
});

export type SeasonsResponse = z.infer<typeof SeasonsResponseSchema>;
