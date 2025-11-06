import { z } from 'zod';
import { decimalSchema } from './../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from './../../../types/zod';

export const CreateBankrollHistorySchema = z.object({
  bankrollId: z.number(),
  balance: decimalSchema,
  unidValue: decimalSchema,
  deposits: decimalSchema.optional().default('0'),
  withdrawals: decimalSchema.optional().default('0'),
  addedBalance: decimalSchema.optional().default('0'),
  gains: decimalSchema.optional().default('0'),
  losses: decimalSchema.optional().default('0'),
  profitAndLoss: decimalSchema.optional().default('0'),
  result: decimalSchema.optional().default('0'),
});

export type CreateBankrollHistoryDTO = SafeInfer<
  typeof CreateBankrollHistorySchema
>;

export const GetBankrollHistorySchema = CreateBankrollHistorySchema.extend({
  id: z.number(),
  date: z.date(),
});

export type GetBankrollHistoryDTO = SafeInfer<typeof GetBankrollHistorySchema>;
