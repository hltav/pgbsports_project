import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const CompetitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  gender: z.string().optional(),
  category: CategorySchema,
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

export type Category = z.infer<typeof CategorySchema>;
export type Competition = z.infer<typeof CompetitionSchema>;
export type CompetitionsResponse = z.infer<typeof CompetitionsResponseSchema>;
export type CompetitionInfo = z.infer<typeof CompetitionInfoSchema>;
