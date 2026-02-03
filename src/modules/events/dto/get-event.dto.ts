import { z } from 'zod';
import { Result, BetType } from '@prisma/client';
import { decimalSchema } from '../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from '../../../types/zod';

const optionalDecimal = decimalSchema.optional().nullable();

// Schema para GET de uma aposta individual
export const GetBetSchema = z.object({
  id: z.number(),
  // === IDs ===
  bankrollId: z.number(),
  userId: z.number(),
  // === REFERÊNCIA AO JOGO REAL ===
  externalMatchId: z.number().nullable().optional(),
  apiSportsEventId: z.string().nullable().optional(),
  tsdbEventId: z.string().nullable().optional(),
  // === CONTEXTO DO EVENTO (SNAPSHOT) ===
  sport: z.string(),
  league: z.string(),
  eventDescription: z.string(),
  eventDate: z.date().nullable().optional(),
  homeTeam: z.string().nullable().optional(),
  awayTeam: z.string().nullable().optional(),
  // === INFORMAÇÕES DO MERCADO ===
  market: z.string(),
  marketCategory: z.string(),
  marketSub: z.string().nullable().optional(),
  selection: z.string(), //escolha do mercado
  // === VALORES DA APOSTA ===
  odd: decimalSchema,
  stake: decimalSchema,
  potentialReturn: decimalSchema,
  actualReturn: optionalDecimal,
  // === SNAPSHOT DA BANCA ===
  bankrollBalance: decimalSchema,
  unitValue: decimalSchema,
  stakeInUnits: decimalSchema,
  // === STATUS E RESULTADO ===
  result: z.nativeEnum(Result),
  // === CAMPOS CALCULADOS ===
  profit: optionalDecimal,
  roi: optionalDecimal,
  isWin: z.boolean().nullable().optional(),
  // === DATAS ===
  placedAt: z.date(),
  settledAt: z.date().nullable().optional(),
  // === METADADOS E ANÁLISE ===
  confidence: z.number().nullable().optional(),
  expectedValue: optionalDecimal,
  betType: z.nativeEnum(BetType),
  isLive: z.boolean(),
  tags: z.any().nullable().optional(),
  notes: z.string().nullable().optional(),
  // === TIMESTAMPS ===
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GetBetDTO = SafeInfer<typeof GetBetSchema>;

// Schema para GET com ExternalMatch incluído

export const GetBetWithMatchSchema = GetBetSchema.extend({
  externalMatch: z
    .object({
      id: z.number(),
      apiEventId: z.string(),
      apiSource: z.string(),
      sport: z.string(),
      league: z.string(),
      homeTeam: z.string(),
      awayTeam: z.string(),
      homeTeamBadge: z.string().nullable().optional(),
      awayTeamBadge: z.string().nullable().optional(),
      homeScoreHT: z.number().nullable().optional(),
      awayScoreHT: z.number().nullable().optional(),
      homeScoreFT: z.number().nullable().optional(),
      awayScoreFT: z.number().nullable().optional(),
      status: z.string(), // MatchStatus como string
      eventDate: z.date(),
      eventDateLocal: z.date().nullable().optional(),
      isPostponed: z.boolean(),
      thumbnail: z.string().nullable().optional(),
      lastSyncAt: z.date(),
    })
    .nullable()
    .optional(),
});

export type GetBetWithMatchDTO = SafeInfer<typeof GetBetWithMatchSchema>;

// Schema para listagem de apostas (resumido)

export const GetBetListItemSchema = z.object({
  id: z.number(),
  sport: z.string(),
  league: z.string(),
  eventDescription: z.string(),
  eventDate: z.date().nullable().optional(),
  market: z.string(),
  selection: z.string(),
  odd: decimalSchema,
  stake: decimalSchema,
  potentialReturn: decimalSchema,
  actualReturn: optionalDecimal,
  result: z.nativeEnum(Result),
  profit: optionalDecimal,
  roi: optionalDecimal,
  placedAt: z.date(),
  settledAt: z.date().nullable().optional(),
  betType: z.nativeEnum(BetType),
  isLive: z.boolean(),

  // Dados básicos do jogo (se houver)
  homeTeam: z.string().nullable().optional(),
  awayTeam: z.string().nullable().optional(),
});

export type GetBetListItemDTO = SafeInfer<typeof GetBetListItemSchema>;

// Schema de resposta paginada

export const GetBetsPaginatedSchema = z.object({
  data: z.array(GetBetListItemSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    perPage: z.number(),
    totalPages: z.number(),
  }),
  summary: z
    .object({
      totalStaked: decimalSchema,
      totalReturned: decimalSchema,
      totalProfit: decimalSchema,
      roi: decimalSchema,
      winRate: z.number(), // porcentagem
      totalBets: z.number(),
      wonBets: z.number(),
      lostBets: z.number(),
      pendingBets: z.number(),
    })
    .optional(),
});

export type GetBetsPaginatedDTO = SafeInfer<typeof GetBetsPaginatedSchema>;

// Schema para filtros de busca

export const BetFiltersSchema = z.object({
  bankrollId: z.number().optional(),
  userId: z.number().optional(),
  sport: z.string().optional(),
  league: z.string().optional(),
  market: z.string().optional(),
  result: z.nativeEnum(Result).optional(),
  betType: z.nativeEnum(BetType).optional(),
  isLive: z.boolean().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  minOdd: z.number().optional(),
  maxOdd: z.number().optional(),
  minStake: z.number().optional(),
  maxStake: z.number().optional(),
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(20),
  sortBy: z
    .enum(['placedAt', 'settledAt', 'stake', 'odd', 'profit', 'roi'])
    .default('placedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type BetFiltersDTO = SafeInfer<typeof BetFiltersSchema>;
