import { z } from 'zod';
import { EventType, Result } from '@prisma/client';
import { decimalSchema } from '../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from '../../../types/zod';

const ResultEnum = z.nativeEnum(Result);

export const CreateEventSchema = z.object({
  bankId: z.number().int().positive(),
  modality: z.string().trim().min(1),
  eventType: z.nativeEnum(EventType).optional().nullish(),
  league: z.string().trim().min(1),
  event: z.string().trim().min(1),
  market: z.string().trim().min(1),
  marketCategory: z.string().trim().optional().default(''),
  marketSub: z.string().trim().optional().default(''),
  optionMarket: z.string().trim().optional().default(''),
  amount: decimalSchema.refine(
    (v) => v.greaterThan(0),
    'Valor deve ser positivo',
  ),
  odd: decimalSchema.refine(
    (v) => v.greaterThan(1),
    'Odd deve ser maior que 1',
  ),
  userId: z.number().int().positive(),
  result: ResultEnum.optional().default('pending'),
  createdAt: z
    .date()
    .optional()
    .default(() => new Date()),
  updatedAt: z
    .date()
    .optional()
    .default(() => new Date()),
});

export type CreateEventDTO = SafeInfer<typeof CreateEventSchema>;
