import { z } from 'zod';

export const UpdateEventSchema = z.object({
  bankId: z.number().optional(),
  eventType: z.string().optional(),
  event: z.string().optional(),
  market: z.string().optional(),
  amount: z.number().optional(),
  result: z.string().optional(),
});

export type UpdateEventDTO = z.infer<typeof UpdateEventSchema>;
