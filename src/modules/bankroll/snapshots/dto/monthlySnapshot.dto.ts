import { decimalSchema } from './../../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from './../../../../types/zod';
import z from 'zod';

export const CreateMonthlySnapshotSchema = z.object({
  bankrollId: z.number().int().positive(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  balance: decimalSchema,
  unidValue: decimalSchema,
  monthlyProfit: decimalSchema,
  monthlyROI: decimalSchema,
  unitsChange: decimalSchema,
  peakBalance: decimalSchema,
  maxDrawdown: decimalSchema,
  drawdownPercent: decimalSchema,
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
