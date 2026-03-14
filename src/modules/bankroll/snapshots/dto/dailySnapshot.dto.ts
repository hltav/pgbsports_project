import { decimalSchema } from '../../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from '../../../../types/zod';
import z from 'zod';

export const CreateDailySnapshotSchema = z.object({
  bankrollId: z.number().int().positive(),
  year: z.number().int().min(1900),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  balance: decimalSchema,
  unidValue: decimalSchema,
  dailyProfit: decimalSchema,
  dailyROI: decimalSchema,
  unitsChange: decimalSchema,
  peakBalance: decimalSchema,
  maxDrawdown: decimalSchema,
  dailyDrawdown: decimalSchema,
  drawdownPercent: decimalSchema,
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
  cumulativeUnits: decimalSchema.optional(),
  createdAt: z.coerce.date(),
});

export type GetDailySnapshotDTO = SafeInfer<typeof GetDailySnapshotSchema>;
