import { z } from 'zod';
import { Result } from '@prisma/client';
import { decimalSchema } from '../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from '../../../types/zod';

export const UpdateEventSchema = z.object({
  bankId: z.number().optional(),
  event: z.string().optional(),
  market: z.string().optional(),
  amount: decimalSchema.optional(),
  result: z.nativeEnum(Result).optional(),
  userId: z.number(),
});
export type UpdateEventDTO = SafeInfer<typeof UpdateEventSchema>;
