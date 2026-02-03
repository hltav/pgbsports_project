// weeklySnapshot.dto.ts
import { decimalSchema } from './../../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from './../../../../types/zod';
import z from 'zod';

export const CreateWeeklySnapshotSchema = z.object({
  bankrollId: z.number().int().positive(),
  year: z.number().int(),
  week: z.number().int().min(1).max(53),

  // Balanços
  balance: decimalSchema,
  unidValue: decimalSchema,

  // Performance
  weeklyProfit: decimalSchema,
  weeklyROI: decimalSchema,
  unitsChange: decimalSchema,

  // Drawdown
  peakBalance: decimalSchema,
  maxDrawdown: decimalSchema,
  drawdownPercent: decimalSchema,

  // Apostas
  betsPlaced: z.number().int().default(0),
  betsWon: z.number().int().default(0),
  betsLost: z.number().int().default(0),
  winRate: decimalSchema,
});

export type CreateWeeklySnapshotDTO = SafeInfer<
  typeof CreateWeeklySnapshotSchema
>;

export const GetWeeklySnapshotSchema = CreateWeeklySnapshotSchema.extend({
  id: z.number().int(),
  createdAt: z.coerce.date(),
});

export type GetWeeklySnapshotDTO = SafeInfer<typeof GetWeeklySnapshotSchema>;
