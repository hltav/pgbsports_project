import { decimalSchema } from './../../../libs/common/dto/decimalSchema.interface';
import { z } from 'zod';
import { SafeInfer } from './../../../types/zod';

export const CreateBankrollSchema = z.object({
  userId: z.number(),
  name: z.string().min(3),
  balance: decimalSchema,
  unidValue: decimalSchema,
  bookmaker: z.string().default('Unknown'),
  initialBalance: decimalSchema.optional(),
});
export type CreateBankrollDTO = SafeInfer<typeof CreateBankrollSchema>;
