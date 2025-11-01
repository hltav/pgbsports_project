import { z } from 'zod';
import { Result } from '@prisma/client';
import { decimalSchema } from '../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from '../../../types/zod';

export const GetEventSchema = z.object({
  id: z.number(),
  bankId: z.number(),
  modality: z.string().min(1),
  league: z.string().min(1),
  odd: decimalSchema,
  event: z.string(),
  market: z.string(),
  marketCategory: z.string(),
  marketSub: z.string().optional().nullable(),
  optionMarket: z.string(),
  amount: decimalSchema,
  result: z.nativeEnum(Result),
  userId: z.number(),
  apiEventId: z.string().optional().nullable(),
  homeTeam: z.string().optional().nullable(),
  awayTeam: z.string().optional().nullable(),
  eventDate: z.date().optional().nullable(),
  leagueBadge: z.string().optional().nullable(),
  season: z.string().optional().nullable(),
  round: z.number().int().optional().nullable(),
  homeTeamBadge: z.string().optional().nullable(),
  awayTeamBadge: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  postponed: z.string().optional().nullable(),
  thumb: z.string().optional().nullable(),
});

export type GetEventDTO = SafeInfer<typeof GetEventSchema>;
