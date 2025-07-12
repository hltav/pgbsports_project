import { z } from 'zod';
import { SafeInfer } from './../../../types/zod';

export const UpdateAddressDto = z.object({
  direction: z.string().nullable().optional(),
  houseNumber: z.number().nullable().optional(),
  neighborhood: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
});

export type UpdateAddressDTO = SafeInfer<typeof UpdateAddressDto>;
