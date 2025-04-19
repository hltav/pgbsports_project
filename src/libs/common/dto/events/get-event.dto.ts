import { z } from 'zod';

export const GetEventSchema = z.object({
  id: z.number(),
  bankId: z.number(),
  eventType: z.string(),
  event: z.string(),
  market: z.string(),
  amount: z.number(),
  result: z.string(),
});

export type GetEventDTO = z.infer<typeof GetEventSchema>;
