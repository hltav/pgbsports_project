import { z } from 'zod';
import { EventType, Result } from '@prisma/client';
import { decimalSchema } from '../../../libs/common/dto/decimalSchema.interface';

export const GetEventSchema = z.object({
  id: z.number(),
  bankId: z.number(),
  eventType: z.nativeEnum(EventType),
  event: z.string(),
  market: z.string(),
  amount: decimalSchema,
  result: z.nativeEnum(Result),
  userId: z.number(),
});
export type GetEventDTO = z.infer<typeof GetEventSchema>;
