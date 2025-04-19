import { z } from 'zod';

export const CreateBankrollSchema = z.object({
  name: z.string().min(1),
  balance: z.number(),
});

export type CreateBankrollDTO = z.infer<typeof CreateBankrollSchema>;
