import { decimalSchema } from '@/libs/common/dto/decimalSchema.interface';
import { z } from 'zod';

export const GetBankrollSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  balance: decimalSchema,
  unidValue: decimalSchema,
  bookmaker: z.string(),
  statusSync: z.union([z.literal('Synchronizing'), z.literal('Synchronized')]),
});
export type GetBankrollDTO = z.infer<typeof GetBankrollSchema>;
