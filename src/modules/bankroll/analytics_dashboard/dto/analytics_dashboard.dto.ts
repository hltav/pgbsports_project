import { decimalSchema } from './../../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from './../../../../types/zod';
import z from 'zod';

export const BankrollStatsSchema = z.object({
  totalBets: z.number().int(),
  wonBets: z.number().int(),
  lostBets: z.number().int(),
  pendingBets: z.number().int(),
  winRate: decimalSchema,
  roi: decimalSchema,
  totalProfit: decimalSchema,
  avgStake: decimalSchema,
  avgOdds: decimalSchema,
  currentStreak: z.number().int(),
  longestWinStreak: z.number().int(),
  longestLoseStreak: z.number().int(),
  biggestWin: decimalSchema,
  biggestLoss: decimalSchema,
});

export type BankrollStatsDTO = SafeInfer<typeof BankrollStatsSchema>;

export const PeriodStatsSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  profit: decimalSchema,
  roi: decimalSchema,
  betsPlaced: z.number().int(),
  winRate: decimalSchema,
});

export type PeriodStatsDTO = SafeInfer<typeof PeriodStatsSchema>;
