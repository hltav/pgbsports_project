import { z } from 'zod';
import { EventType, Result } from '@prisma/client';
import { decimalSchema } from '../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from '../../../types/zod';

export const GetEventSchema = z.object({
  id: z.number(),
  bankId: z.number(),
  eventType: z.nativeEnum(EventType).nullish(),
  modality: z.string().min(1),
  league: z.string().min(1),
  category: z.string().min(1),
  event: z.string(),
  market: z.string(),
  amount: decimalSchema,
  result: z.nativeEnum(Result),
  userId: z.number(),
});
export type GetEventDTO = SafeInfer<typeof GetEventSchema>;
