import { decimalSchema } from './../../../libs/common/dto/decimalSchema.interface';
import { z } from 'zod';
import { SafeInfer } from './../../../types/zod';

export const UpdateBankrollSchema = z.object({
  userId: z.number().optional(),
  name: z
    .string()
    .min(1, 'O nome da banca deve ter pelo menos 1 caractere')
    .optional(),
  balance: decimalSchema.optional(),
  unidValue: decimalSchema.optional(),
  bookmaker: z.string().optional(),
  initialBalance: decimalSchema.optional(),
  totalDeposited: decimalSchema.optional().default('0'),
  totalWithdrawn: decimalSchema.optional().default('0'),
  totalStaked: decimalSchema.optional().default('0'),
  totalReturned: decimalSchema.optional().default('0'),
});

export type UpdateBankrollDTO = SafeInfer<typeof UpdateBankrollSchema>;

export const PatchBankrollSchema = z.object({
  userId: z.number().optional(),
  name: z
    .string()
    .min(1, 'O nome da banca deve ter pelo menos 1 caractere')
    .optional(),
  balance: decimalSchema.optional(),
  unidValue: decimalSchema.optional(),
  bookmaker: z.string().optional(),
  initialBalance: decimalSchema.optional(),
  totalDeposited: decimalSchema.optional(),
  totalWithdrawn: decimalSchema.optional(),
  totalStaked: decimalSchema.optional(),
  totalReturned: decimalSchema.optional(),
});

export type PatchBankrollDTO = SafeInfer<typeof PatchBankrollSchema>;
