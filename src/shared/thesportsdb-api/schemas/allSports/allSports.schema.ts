import { z } from 'zod';

export const SportSchema = z.object({
  idSport: z.string(),
  strSport: z.string(),
  strFormat: z.string().nullable().optional(),
  strSportThumb: z.string().url().nullable().optional(),
  strSportThumbBW: z.string().url().nullable().optional(),
  strSportIconGreen: z.string().url().nullable().optional(),
  strSportDescription: z.string().nullable().optional(),
});

export const AllSportsResponseSchema = z.object({
  all: z.array(SportSchema),
});

export type Sport = z.infer<typeof SportSchema>;
export type AllSportsResponse = z.infer<typeof AllSportsResponseSchema>;
