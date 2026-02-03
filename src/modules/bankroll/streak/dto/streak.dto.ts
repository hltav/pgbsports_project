import { optionalDateSchema } from '../../z.dto/bankroll.dto';
import { decimalSchema } from './../../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from './../../../../types/zod';
import z from 'zod';

export const CreateBankrollStreakSchema = z.object({
  bankrollId: z.number().int().positive(),
  type: z.string().max(50), // WIN_STREAK, LOSS_STREAK, etc
  length: z.number().int().positive(),
  startDate: z.coerce.date(),
  endDate: optionalDateSchema,
  totalProfit: decimalSchema,
  totalROI: decimalSchema,
});

export type CreateBankrollStreakDTO = SafeInfer<
  typeof CreateBankrollStreakSchema
>;

export const GetBankrollStreakSchema = CreateBankrollStreakSchema.extend({
  id: z.number().int(),
  createdAt: z.coerce.date(),
});

export type GetBankrollStreakDTO = SafeInfer<typeof GetBankrollStreakSchema>;
