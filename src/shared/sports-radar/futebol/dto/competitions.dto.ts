import { z } from 'zod';

export const OddSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const CompetitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  gender: z.string().optional(),
  odd: OddSchema,
});

export const CompetitionsResponseSchema = z.object({
  generated_at: z.string(),
  competitions: z.array(CompetitionSchema),
});

export const CompetitionInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  start_date: z.string(),
  end_date: z.string(),
});

export type Odd = z.infer<typeof OddSchema>;
export type Competition = z.infer<typeof CompetitionSchema>;
export type CompetitionsResponse = z.infer<typeof CompetitionsResponseSchema>;
export type CompetitionInfo = z.infer<typeof CompetitionInfoSchema>;
