// import { decimalSchema } from './../../../libs/common/dto/decimalSchema.interface';
// import { z } from 'zod';
// import { SafeInfer } from './../../../types/zod';

// export const UpdateBankrollSchema = z.object({
//   userId: z.number(),
//   name: z.string().min(1).optional(),
//   balance: decimalSchema.optional(),
//   unidValue: decimalSchema.optional(),
// });

// export type UpdateBankrollDTO = SafeInfer<typeof UpdateBankrollSchema>;

// export const PatchBankrollSchema = z.object({
//   userId: z.number().optional(),
//   name: z.string().min(1).optional(),
//   balance: decimalSchema.optional(),
//   unidValue: decimalSchema.optional(),
// });

// export type PatchBankrollDTO = SafeInfer<typeof PatchBankrollSchema>;

import { decimalSchema } from './../../../libs/common/dto/decimalSchema.interface';
import { z } from 'zod';
import { SafeInfer } from './../../../types/zod';

export const UpdateBankrollSchema = z.object({
  userId: z.number(),
  name: z.string().min(1).optional(),
  balance: decimalSchema.optional(),
  unidValue: decimalSchema.optional(),
  deposits: decimalSchema.optional().default('0'),
  withdrawals: decimalSchema.optional().default('0'),
});

export type UpdateBankrollDTO = SafeInfer<typeof UpdateBankrollSchema>;

export const PatchBankrollSchema = z.object({
  userId: z.number().optional(),
  name: z.string().min(1).optional(),
  balance: decimalSchema.optional(),
  unidValue: decimalSchema.optional(),
  deposits: decimalSchema.optional().default('0'),
  withdrawals: decimalSchema.optional().default('0'),
});

export type PatchBankrollDTO = SafeInfer<typeof PatchBankrollSchema>;
