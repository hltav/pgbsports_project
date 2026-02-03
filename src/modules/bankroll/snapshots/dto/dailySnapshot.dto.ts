import { decimalSchema } from '../../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from '../../../../types/zod';
import z from 'zod';

export const CreateDailySnapshotSchema = z.object({
  bankrollId: z.number().int().positive(),
  year: z.number().int().min(1900),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),

  // Balanços
  balance: decimalSchema,
  unidValue: decimalSchema,

  // Performance diária
  dailyProfit: decimalSchema,
  dailyROI: decimalSchema,
  unitsChange: decimalSchema,

  // Drawdown
  peakBalance: decimalSchema,
  maxDrawdown: decimalSchema,
  dailyDrawdown: decimalSchema,
  drawdownPercent: decimalSchema,

  // Apostas
  betsPlaced: z.number().int().default(0),
  betsWon: z.number().int().default(0),
  betsLost: z.number().int().default(0),
  winRate: decimalSchema,
});

export type CreateDailySnapshotDTO = SafeInfer<
  typeof CreateDailySnapshotSchema
>;

export const GetDailySnapshotSchema = CreateDailySnapshotSchema.extend({
  id: z.number().int(),
  createdAt: z.coerce.date(),
});

export type GetDailySnapshotDTO = SafeInfer<typeof GetDailySnapshotSchema>;
