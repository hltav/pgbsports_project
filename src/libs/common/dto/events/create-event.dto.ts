import { z } from 'zod';

export const CreateEventSchema = z.object({
  bankId: z.number(),
  eventType: z.string().min(1),
  event: z.string().min(1),
  market: z.string().min(1),
  amount: z.number(),
  result: z.string().optional(),
});

export type CreateEventDTO = z.infer<typeof CreateEventSchema>;
