import { z } from 'zod';
import { EventType, Result } from '@prisma/client';

export const GetEventSchema = z.object({
  id: z.number(),
  bankId: z.number(),
  eventType: z.nativeEnum(EventType),
  event: z.string(),
  market: z.string(),
  amount: z.number(),
  result: z.nativeEnum(Result),
  userId: z.number(),
});

export type GetEventDTO = z.infer<typeof GetEventSchema>;
