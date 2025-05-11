import { z } from 'zod';

export const CreateBankrollSchema = z.object({
  userId: z.number(),
  name: z.string().min(3),
  balance: z.number(),
  unidValue: z.number(),
  bookmaker: z.string().optional().default('Unknown'),
  statusSync: z
    .enum(['Connected', 'Disconnected', 'Synchronizing'])
    .default('Synchronizing'),
});

export type CreateBankrollDTO = z.infer<typeof CreateBankrollSchema>;
