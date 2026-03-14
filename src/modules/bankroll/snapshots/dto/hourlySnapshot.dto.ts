import { decimalSchema } from '../../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from '../../../../types/zod';
import z from 'zod';

export const CreateHourlySnapshotSchema = z.object({
  bankrollId: z.number().int().positive(),
  bucketStart: z.coerce.date(),
  balance: decimalSchema,
  unidValue: decimalSchema,
  hourlyProfit: decimalSchema,
  hourlyROI: decimalSchema,
  unitsChange: decimalSchema,
  peakBalance: decimalSchema,
  maxDrawdown: decimalSchema,
  hourlyDrawdown: decimalSchema,
  drawdownPercent: decimalSchema,
  betsPlaced: z.number().int().default(0),
  betsWon: z.number().int().default(0),
  betsLost: z.number().int().default(0),
  winRate: decimalSchema,
});

export type CreateHourlySnapshotDTO = SafeInfer<
  typeof CreateHourlySnapshotSchema
>;

export const GetHourlySnapshotSchema = CreateHourlySnapshotSchema.extend({
  id: z.number().int(),
  cumulativeUnits: decimalSchema.optional(),
  createdAt: z.coerce.date(),
});

export type GetHourlySnapshotDTO = SafeInfer<typeof GetHourlySnapshotSchema>;
