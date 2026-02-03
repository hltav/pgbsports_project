// monthlySnapshot.dto.ts
import { decimalSchema } from './../../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from './../../../../types/zod';
import z from 'zod';

export const CreateMonthlySnapshotSchema = z.object({
  bankrollId: z.number().int().positive(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),

  // Balanços
  balance: decimalSchema,
  unidValue: decimalSchema,

  // Performance
  monthlyProfit: decimalSchema,
  monthlyROI: decimalSchema,
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

export type CreateMonthlySnapshotDTO = SafeInfer<
  typeof CreateMonthlySnapshotSchema
>;

export const GetMonthlySnapshotSchema = CreateMonthlySnapshotSchema.extend({
  id: z.number().int(),
  createdAt: z.coerce.date(),
});

export type GetMonthlySnapshotDTO = SafeInfer<typeof GetMonthlySnapshotSchema>;
