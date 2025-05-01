import { z } from 'zod';
import { EventType, Result } from '@prisma/client';

export const CreateEventSchema = z.object({
  bankId: z.number(),
  eventType: z.nativeEnum(EventType),
  event: z.string().min(1),
  market: z.string().min(1),
  amount: z.number(),
  result: z.nativeEnum(Result).optional(),
  userId: z.number(),
});

export type CreateEventDTO = z.infer<typeof CreateEventSchema>;
