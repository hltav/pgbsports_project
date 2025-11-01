import { z } from 'zod';
import { Result } from '@prisma/client';
import { decimalSchema } from '../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from '../../../types/zod';

const ResultEnum = z.nativeEnum(Result);

export const CreateEventSchema = z.object({
  bankId: z.number().int().positive(),
  modality: z.string().trim().min(1),
  league: z.string().trim().min(1),
  event: z.string().trim().min(1),
  market: z.string().trim().min(1),
  marketCategory: z.string().trim().min(1),
  marketSub: z.string().trim().optional().nullable(),
  optionMarket: z.string().trim().min(1),
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
  apiEventId: z.string().optional().nullable(),
  homeTeam: z.string().optional().nullable(),
  awayTeam: z.string().optional().nullable(),
  eventDate: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === 'string' ? new Date(val) : val))
    .optional()
    .nullable(),
  createdAt: z
    .date()
    .optional()
    .default(() => new Date()),
  updatedAt: z
    .date()
    .optional()
    .default(() => new Date()),
  strBadge: z.string().optional().nullable(),
  strSeason: z.string().optional().nullable(),
  intRound: z.number().optional().nullable(),
  strHomeTeamBadge: z.string().optional().nullable(),
  strAwayTeamBadge: z.string().optional().nullable(),
  strCountry: z.string().optional().nullable(),
  strStatus: z.string().optional().nullable(),
  strPostponed: z.string().optional().nullable(),
  strThumb: z.string().optional().nullable(),
});

export type CreateEventDTO = SafeInfer<typeof CreateEventSchema>;
