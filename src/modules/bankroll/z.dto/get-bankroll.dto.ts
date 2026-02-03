import { z } from 'zod';
import { decimalSchema } from '../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from '../../../types/zod';
import { GetBankrollHistorySchema } from './history/createHistories.dto';

export const GetBankrollSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  balance: decimalSchema,
  unidValue: decimalSchema,
  bookmaker: z.string().default('Unknown'),
  initialBalance: decimalSchema,
  totalDeposited: decimalSchema,
  totalWithdrawn: decimalSchema,
  totalStaked: decimalSchema,
  totalReturned: decimalSchema,
  lastHistory: GetBankrollHistorySchema.nullable().optional(),
  histories: z.array(GetBankrollHistorySchema).optional(),
});

export type GetBankrollDTO = SafeInfer<typeof GetBankrollSchema>;
