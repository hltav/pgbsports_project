import { decimalSchema } from '../../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from '../../../../types/zod';
import z from 'zod';

export const CreateYearlySnapshotSchema = z.object({
  bankrollId: z.number().int().positive(),
  year: z.number().int(),

  // Balanços
  balance: decimalSchema,
  unidValue: decimalSchema,

  // Performance
  yearlyProfit: decimalSchema,
  yearlyROI: decimalSchema,
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

export type CreateYearlySnapshotDTO = SafeInfer<
  typeof CreateYearlySnapshotSchema
>;

export const GetYearlySnapshotSchema = CreateYearlySnapshotSchema.extend({
  id: z.number().int(),
  createdAt: z.coerce.date(),
});

export type GetYearlySnapshotDTO = SafeInfer<typeof GetYearlySnapshotSchema>;
