import { z } from 'zod';
import { SafeInfer } from './../../../types/zod';

export const CreateAddressDto = z.object({
  direction: z.string().optional(),
  houseNumber: z.number().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

export type CreateAddressDTO = SafeInfer<typeof CreateAddressDto>;
