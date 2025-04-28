import { z } from 'zod';

export const CreateBankrollSchema = z.object({
  userId: z.number(),
  name: z.string().min(3),
  balance: z.number(),
  unidValue: z.number(),
});

export type CreateBankrollDTO = z.infer<typeof CreateBankrollSchema>;
