import { z } from 'zod';
import { EventType, Result } from '@prisma/client';

export const UpdateEventSchema = z.object({
  bankId: z.number().optional(),
  eventType: z.nativeEnum(EventType).optional(),
  event: z.string().optional(),
  market: z.string().optional(),
  amount: z.number().optional(),
  result: z.nativeEnum(Result).optional(),
  userId: z.number(),
});

export type UpdateEventDTO = z.infer<typeof UpdateEventSchema>;
