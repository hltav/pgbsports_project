import { z } from 'zod';

export const VenueSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  capacity: z.number(),
  surface: z.string(),
  image: z.string(),
});
export type Venue = z.infer<typeof VenueSchema>;

export const TeamSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable(),
  country: z.string(),
  founded: z.number(),
  national: z.boolean(),
  logo: z.string(),
});
export type Team = z.infer<typeof TeamSchema>;

export const TeamResponseItemSchema = z.object({
  team: TeamSchema,
  venue: VenueSchema,
});
export type TeamResponseItem = z.infer<typeof TeamResponseItemSchema>;

export const TeamsResponseSchema = z.object({
  get: z.literal('teams'),
  parameters: z.object({
    name: z.string(),
  }),
  errors: z.array(z.string()),
  results: z.number(),
  paging: z.object({
    current: z.number(),
    total: z.number(),
  }),
  response: z.array(TeamResponseItemSchema),
});
export type TeamsResponse = z.infer<typeof TeamsResponseSchema>;
