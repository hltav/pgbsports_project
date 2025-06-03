import { decimalSchema } from '@/libs/common/dto/decimalSchema.interface';
import { z } from 'zod';

export const CreateBankrollSchema = z.object({
  userId: z.number(),
  name: z.string().min(3),
  balance: decimalSchema,
  unidValue: decimalSchema,
  bookmaker: z.string().default('Unknown'),
});
export type CreateBankrollDTO = z.infer<typeof CreateBankrollSchema>;
