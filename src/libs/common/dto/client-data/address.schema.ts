import { z } from 'zod';

export const AddressSchema = z.object({
  id: z.number(),
  direction: z.string().nullable(),
  houseNumber: z.number().nullable(),
  neighborhood: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().nullable(),
  clientDataId: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AddressDTO = z.infer<typeof AddressSchema>;
