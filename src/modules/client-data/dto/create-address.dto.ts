import { z } from 'zod';

export const CreateAddressDto = z.object({
  direction: z.string().optional(),
  houseNumber: z.number().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

export type CreateAddressDTO = z.infer<typeof CreateAddressDto>;
