import { z } from 'zod';
import { SafeInfer } from './../../../types/zod';

export const AdjustBalanceSchema = z.object({
  amount: z.number(),
  reason: z.string().min(3),
});

export type AdjustBalanceDto = SafeInfer<typeof AdjustBalanceSchema>;
