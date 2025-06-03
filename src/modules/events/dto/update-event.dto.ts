import { z } from 'zod';
import { EventType, Result } from '@prisma/client';
import { decimalSchema } from '../../../libs/common/dto/decimalSchema.interface';

export const UpdateEventSchema = z.object({
  bankId: z.number().optional(),
  eventType: z.nativeEnum(EventType).optional(),
  event: z.string().optional(),
  market: z.string().optional(),
  amount: decimalSchema.optional(),
  result: z.nativeEnum(Result).optional(),
  userId: z.number(),
});
export type UpdateEventDTO = z.infer<typeof UpdateEventSchema>;
