import { z } from 'zod';
import { AddressSchema } from './address.schema';
import { SafeInfer } from './../../../types/zod';

export const ClientDataSchema = z.object({
  id: z.number(),
  gender: z.string().optional(),
  cpf: z.string().optional(),
  image: z.string().optional(),
  phone: z.string().optional(),
  userId: z.number().optional(),
  address: AddressSchema.nullable().optional(),
});

export type ClientDataDTO = SafeInfer<typeof ClientDataSchema>;
