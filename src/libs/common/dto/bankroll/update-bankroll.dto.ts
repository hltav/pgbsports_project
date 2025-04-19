import { z } from 'zod';

export const UpdateBankrollSchema = z.object({
  name: z.string().min(1).optional(),
  balance: z.number().optional(),
});

export type UpdateBankrollDTO = z.infer<typeof UpdateBankrollSchema>;
