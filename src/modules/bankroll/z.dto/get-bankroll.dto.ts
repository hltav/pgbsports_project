import { z } from 'zod';
import { decimalSchema } from './../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from './../../../types/zod';
import { GetBankrollHistorySchema } from './createHistories.dto';

export const GetBankrollSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  balance: decimalSchema,
  unidValue: decimalSchema,
  bookmaker: z.string().nullable().default('Unknown'),
  initialBalance: decimalSchema,
  totalDeposited: decimalSchema.optional(),
  totalWithdrawn: decimalSchema.optional(),
  totalStaked: decimalSchema.optional(),
  totalReturned: decimalSchema.optional(),
  lastHistory: GetBankrollHistorySchema.nullable().optional(),
  history: z.array(GetBankrollHistorySchema).optional(),
  histories: z.array(GetBankrollHistorySchema).optional(),
});

export type GetBankrollDTO = SafeInfer<typeof GetBankrollSchema>;
