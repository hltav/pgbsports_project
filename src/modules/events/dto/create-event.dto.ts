import { z } from 'zod';
import { EventType, Result } from '@prisma/client';
import { decimalSchema } from '../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from '../../../types/zod';

export const CreateEventSchema = z.object({
  bankId: z.number(),
  eventType: z.nativeEnum(EventType).nullish(),
  modality: z.string().min(1),
  league: z.string().min(1),
  category: z.string().min(1),
  event: z.string().min(1),
  market: z.string().min(1),
  amount: decimalSchema,
  result: z.nativeEnum(Result).optional(),
  userId: z.number(),
});
export type CreateEventDTO = SafeInfer<typeof CreateEventSchema>;
