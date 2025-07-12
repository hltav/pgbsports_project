import { decimalSchema } from './../../../libs/common/dto/decimalSchema.interface';
import { z } from 'zod';
import { SafeInfer } from './../../../types/zod';

export const GetBankrollSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  balance: decimalSchema,
  unidValue: decimalSchema,
  bookmaker: z.string(),
  statusSync: z.union([z.literal('Synchronizing'), z.literal('Synchronized')]),
});
export type GetBankrollDTO = SafeInfer<typeof GetBankrollSchema>;
