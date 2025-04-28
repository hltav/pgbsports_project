import { z } from 'zod';

export const GetBankrollSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  balance: z.number(),
  unidValue: z.number(),
});

export type GetBankrollDTO = z.infer<typeof GetBankrollSchema>;
