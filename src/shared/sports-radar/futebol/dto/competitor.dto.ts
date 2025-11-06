import { z } from 'zod';

export const JerseySchema = z.object({
  type: z.string(),
  base: z.string(),
  sleeve: z.string(),
  number: z.string(),
  squares: z.boolean().optional(),
  stripes: z.boolean().optional(),
  stripes_color: z.string().optional(),
  horizontal_stripes: z.boolean().optional(),
  split: z.boolean().optional(),
  shirt_type: z.string().optional(),
  sleeve_detail: z.string().optional(),
});

export const CompetitorSchema = z.object({
  id: z.string(),
  name: z.string(),
  short_name: z.string().optional(),
  country: z.string().optional(),
  country_code: z.string().max(3).optional(),
  abbreviation: z.string().optional(),
  gender: z.string().optional(),
});

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  country_code: z.string().max(3).optional(),
});

export const SportSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const ManagerSchema = z.object({
  id: z.string(),
  name: z.string(),
  date_of_birth: z.string().optional(),
  nationality: z.string().optional(),
  country_code: z.string().max(3).optional(),
  gender: z.string().optional(),
});

export const VenueSchema = z.object({
  id: z.string(),
  name: z.string(),
  capacity: z.number().int().optional(),
  city_name: z.string().optional(),
  country_name: z.string().optional(),
  map_coordinates: z.string().optional(),
  country_code: z.string().max(3).optional(),
  timezone: z.string().optional(),
});

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  date_of_birth: z.string().optional(),
  nationality: z.string().optional(),
  country_code: z.string().max(3).optional(),
  height: z.number().int().optional(),
  weight: z.number().int().optional(),
  jersey_number: z.number().int().nullable().optional(),
  preferred_foot: z.string().optional(),
  place_of_birth: z.string().optional(),
  gender: z.string().optional(),
});

export const CompetitorsSchema = z.object({
  generated_at: z.string(),
  competitor: CompetitorSchema,
  category: CategorySchema,
  sport: SportSchema,
  jerseys: z.array(JerseySchema),
  manager: ManagerSchema,
  venue: VenueSchema,
  players: z.array(PlayerSchema),
});

export type CompetitorsDTO = z.infer<typeof CompetitorsSchema>;
