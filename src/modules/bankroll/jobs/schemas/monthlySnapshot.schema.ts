import { Decimal } from './../../../../libs/database/prisma/decimal';
import { z } from 'zod';

// 1. Schema para WeeklySnapshotData
export const WeeklySnapshotDataSchema = z.object({
  bankrollId: z.number().int(),
  week: z.number().int().min(1).max(53),
  balance: z.instanceof(Decimal),
  unidValue: z.instanceof(Decimal),
  weeklyProfit: z.instanceof(Decimal),
  peakBalance: z.instanceof(Decimal),
  maxDrawdown: z.instanceof(Decimal),
  betsPlaced: z.number().int().nonnegative(),
  betsWon: z.number().int().nonnegative(),
  betsLost: z.number().int().nonnegative(),
});

// 2. Schema para PreviousMonthlySnapshotData
// Usamos .nullable() para refletir o "| null" da sua interface original
export const PreviousMonthlySnapshotDataSchema = z
  .object({
    balance: z.instanceof(Decimal),
    unidValue: z.instanceof(Decimal),
  })
  .nullable();

// --- Tipos Inferidos ---
export type WeeklySnapshotData = z.infer<typeof WeeklySnapshotDataSchema>;
export type PreviousMonthlySnapshotData = z.infer<
  typeof PreviousMonthlySnapshotDataSchema
>;
