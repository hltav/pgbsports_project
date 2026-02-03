import { decimalSchema } from '../../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from '../../../../types/zod';
import z from 'zod';

export const CreateHourlySnapshotSchema = z.object({
  bankrollId: z.number().int().positive(),
  /**
   * Início da hora (bucket).
   * Ex: 2026-01-31T13:00:00.000Z
   */
  bucketStart: z.coerce.date(),
  // Balanços
  balance: decimalSchema,
  unidValue: decimalSchema,
  // Performance horária
  hourlyProfit: decimalSchema,
  hourlyROI: decimalSchema,
  unitsChange: decimalSchema,
  // Drawdown
  peakBalance: decimalSchema,
  maxDrawdown: decimalSchema,
  hourlyDrawdown: decimalSchema,
  drawdownPercent: decimalSchema,
  // Apostas
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
  createdAt: z.coerce.date(),
});

export type GetHourlySnapshotDTO = SafeInfer<typeof GetHourlySnapshotSchema>;
