import { z } from 'zod';

export const UpdateBankrollSchema = z.object({
  userId: z.number(),
  name: z.string().min(1).optional(),
  balance: z.number().optional(),
  unidValue: z.number().optional(),
});

export type UpdateBankrollDTO = z.infer<typeof UpdateBankrollSchema>;
