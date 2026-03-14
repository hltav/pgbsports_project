import { z } from 'zod';

export const SettleEventJobDataSchema = z.object({
  eventKey: z.string(),
  betIds: z.array(z.number()),
});

export type SettleEventJobData = z.infer<typeof SettleEventJobDataSchema>;

export const EarlyWinnerEventJobDataSchema = z.object({
  key: z.string(),
  betIds: z.array(z.number()),
});

export type EarlyWinnerEventJobData = z.infer<
  typeof EarlyWinnerEventJobDataSchema
>;

export const LinkBetJobDataSchema = z.object({
  betId: z.number(),
});

export type LinkBetJobData = z.infer<typeof LinkBetJobDataSchema>;

export const SyncFixtureJobDataSchema = z.object({
  apiSportsEventId: z.string(),
});

export type SyncFixtureJobData = z.infer<typeof SyncFixtureJobDataSchema>;

export const HourlySnapshotJobDataSchema = z.object({
  bucketStart: z.string().datetime(),
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export type HourlySnapshotJobData = z.infer<typeof HourlySnapshotJobDataSchema>;

export const DailySnapshotJobDataSchema = z.object({
  date: z.string().datetime(),
});

export type DailySnapshotJobData = z.infer<typeof DailySnapshotJobDataSchema>;

export const WeeklySnapshotJobDataSchema = z.object({
  year: z.number().int(),
  week: z.number().int().min(1).max(53),
});

export type WeeklySnapshotJobData = z.infer<typeof WeeklySnapshotJobDataSchema>;

export const MonthlySnapshotJobDataSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
});

export type MonthlySnapshotJobData = z.infer<
  typeof MonthlySnapshotJobDataSchema
>;

export const YearlySnapshotJobDataSchema = z.object({
  year: z.number().int(),
});

export type YearlySnapshotJobData = z.infer<typeof YearlySnapshotJobDataSchema>;

export const FrequentJobDataSchema = z.union([
  SettleEventJobDataSchema,
  EarlyWinnerEventJobDataSchema,
  LinkBetJobDataSchema,
  SyncFixtureJobDataSchema,
]);

export const HeavyJobDataSchema = z.union([
  HourlySnapshotJobDataSchema,
  DailySnapshotJobDataSchema,
  WeeklySnapshotJobDataSchema,
  MonthlySnapshotJobDataSchema,
  YearlySnapshotJobDataSchema,
]);

// Inferência dos tipos TS para manter compatibilidade com seu código atual
export type FrequentJobData = z.infer<typeof FrequentJobDataSchema>;
export type HeavyJobData = z.infer<typeof HeavyJobDataSchema>;
