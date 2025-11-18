import { z } from 'zod';
import { decimalSchema } from './../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from './../../../types/zod';

export const CreateBankrollSchema = z.object({
  userId: z.number(),
  name: z.string().min(3, 'O nome da banca deve ter pelo menos 3 caracteres'),
  balance: decimalSchema,
  unidValue: decimalSchema,
  bookmaker: z.string().default('Unknown'),
  initialBalance: decimalSchema.optional(),
  totalDeposited: decimalSchema.optional().default('0'),
  totalWithdrawn: decimalSchema.optional().default('0'),
  totalStaked: decimalSchema.optional().default('0'),
  totalReturned: decimalSchema.optional().default('0'),
});

export type CreateBankrollDTO = SafeInfer<typeof CreateBankrollSchema>;
