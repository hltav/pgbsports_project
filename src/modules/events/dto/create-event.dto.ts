import { z } from 'zod';
import { Result, BetType } from '@prisma/client';
import { decimalSchema } from '../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from '../../../types/zod';

const optionalDecimal = decimalSchema.optional().nullable();

export const CreateBetSchema = z.object({
  bankrollId: z.number().int().positive(),
  externalMatchId: z.number().int().positive(),
  apiSportsEventId: z.string().trim().optional().nullable(),
  tsdbEventId: z.string().trim().optional().nullable(),
  sport: z.string().trim().min(1, 'Esporte é obrigatório'),
  league: z.string().trim().min(1, 'Liga é obrigatória'),
  eventDescription: z
    .string()
    .trim()
    .min(1, 'Descrição do evento é obrigatória')
    .max(255),
  eventDate: z.coerce.date().optional().nullable(),
  homeTeam: z.string().trim().optional().nullable(),
  awayTeam: z.string().trim().optional().nullable(),
  homeTeamBadge: z.string().trim().optional().nullable(),
  awayTeamBadge: z.string().trim().optional().nullable(),
  leagueBadge: z.string().trim().optional().nullable(),
  market: z.string().trim().min(1, 'Mercado é obrigatório'),
  marketCategory: z
    .string()
    .trim()
    .min(1, 'Categoria do mercado é obrigatória'),
  marketSub: z.string().trim().optional().nullable(),
  selection: z.string().trim().min(1, 'Seleção é obrigatória'),
  odd: z.preprocess(
    (val) => Number(val),
    decimalSchema.refine((v) => v.greaterThan(1)),
  ),
  stake: z.preprocess(
    (val) => Number(val),
    decimalSchema.refine((v) => v.greaterThan(0)),
  ),
  potentialReturn: optionalDecimal,
  actualReturn: optionalDecimal,
  bankrollBalance: optionalDecimal,
  unitValue: decimalSchema,
  stakeInUnits: optionalDecimal,
  result: z.nativeEnum(Result).optional().default(Result.pending),
  profit: optionalDecimal,
  roi: optionalDecimal,
  isWin: z.boolean().optional().nullable(),
  settledAt: z.date().optional().nullable(),
  confidence: z.number().int().min(1).max(10).optional().nullable(),
  expectedValue: optionalDecimal,
  betType: z.nativeEnum(BetType).optional().default('SINGLE'),
  isLive: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CreateBetDTO = SafeInfer<typeof CreateBetSchema>;

export const UpdateBetSchema = CreateBetSchema.partial().extend({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
});

export type UpdateBetDTO = SafeInfer<typeof UpdateBetSchema>;

export const SettleBetSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  result: z.nativeEnum(Result),
  actualReturn: decimalSchema.refine(
    (v) => v.greaterThanOrEqualTo(0),
    'Retorno não pode ser negativo',
  ),
  settledAt: z
    .date()
    .optional()
    .default(() => new Date()),
});

export type SettleBetDTO = SafeInfer<typeof SettleBetSchema>;
