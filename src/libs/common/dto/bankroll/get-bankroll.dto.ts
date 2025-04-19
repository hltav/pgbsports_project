import { z } from 'zod';

export const GetBankrollSchema = z.object({
  id: z.number(),
  name: z.string(),
  balance: z.number(),
});

export type GetBankrollDTO = z.infer<typeof GetBankrollSchema>;
