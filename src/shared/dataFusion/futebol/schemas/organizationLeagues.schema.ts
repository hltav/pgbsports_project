import { z } from 'zod';

export const GetOrganizedLeaguesDtoSchema = z.object({
  season: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === 'current' || !isNaN(Number(val)),
      'Season must be "current" or a valid number',
    ),

  refresh: z.preprocess((val) => val === 'true', z.boolean()),
});

export type GetOrganizedLeaguesDto = z.infer<
  typeof GetOrganizedLeaguesDtoSchema
>;

export const InvalidateCacheDtoSchema = z.object({
  season: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === 'current' || !isNaN(Number(val)),
      'Season must be "current" or a valid number',
    ),
});

export type InvalidateCacheDto = z.infer<typeof InvalidateCacheDtoSchema>;

export function parseSeason(season?: string): number | 'current' | undefined {
  if (!season) return undefined;
  if (season === 'current') return 'current';
  const num = Number(season);
  return isNaN(num) ? undefined : num;
}
