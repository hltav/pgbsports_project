import { z } from 'zod';

export const GetBankrollSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  balance: z.number(),
  unidValue: z.number(),
  bookmaker: z.string(),
  statusSync: z.string(),
});

export type GetBankrollDTO = z.infer<typeof GetBankrollSchema>;
