import { decimalSchema } from './../../../libs/common/dto/decimalSchema.interface';
import { z } from 'zod';
import { SafeInfer } from './../../../types/zod';
import { GetBankrollHistorySchema } from './createHistories.dto';

// export const GetBankrollSchema = z.object({
//   id: z.number(),
//   userId: z.number(),
//   name: z.string(),
//   balance: decimalSchema,
//   unidValue: decimalSchema,
//   bookmaker: z.string(),
//   initialBalance: decimalSchema,
//   statusSync: z.union([z.literal('Synchronizing'), z.literal('Synchronized')]),
// });

export const GetBankrollSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  balance: decimalSchema,
  unidValue: decimalSchema,
  bookmaker: z.string(),
  initialBalance: decimalSchema,
  statusSync: z.union([z.literal('Synchronizing'), z.literal('Synchronized')]),
  lastHistory: GetBankrollHistorySchema.optional(), // Último registro de histórico
});
export type GetBankrollDTO = SafeInfer<typeof GetBankrollSchema>;
