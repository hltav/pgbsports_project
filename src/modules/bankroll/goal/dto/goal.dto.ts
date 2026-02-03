import { optionalDateSchema } from '../../z.dto/bankroll.dto';
import { decimalSchema } from './../../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from './../../../../types/zod';
import z from 'zod';

export const CreateBankrollGoalSchema = z.object({
  bankrollId: z.number().int().positive(),
  description: z.string().max(255),
  targetProfit: decimalSchema,
  currentValue: decimalSchema.optional().default('0'),
  period: z
    .enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'])
    .optional()
    .nullable(),
  deadline: optionalDateSchema,
  isActive: z.boolean().default(true),
});

export type CreateBankrollGoalDTO = SafeInfer<typeof CreateBankrollGoalSchema>;

export const UpdateBankrollGoalSchema = z.object({
  id: z.number().int().positive(),
  description: z.string().max(255).optional(),
  targetProfit: decimalSchema.optional(),
  currentValue: decimalSchema.optional(),
  deadline: optionalDateSchema,
  achievedAt: optionalDateSchema,
  isActive: z.boolean().optional(),
});

export type UpdateBankrollGoalDTO = SafeInfer<typeof UpdateBankrollGoalSchema>;

export const GetBankrollGoalSchema = CreateBankrollGoalSchema.extend({
  id: z.number().int(),
  achievedAt: optionalDateSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type GetBankrollGoalDTO = SafeInfer<typeof GetBankrollGoalSchema>;
