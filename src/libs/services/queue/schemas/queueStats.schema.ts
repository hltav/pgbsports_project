import { z } from 'zod';

// 1. Schema para QueueStats
export const QueueStatsSchema = z.object({
  waiting: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  delayed: z.number().int().nonnegative(),
});

// 2. Schema para JobProgress (Union: number | string | object)
export const JobProgressSchema = z.union([
  z.number(),
  z.string(),
  z.boolean(),
  z.record(z.any()),
]);

// 3. Schema para SerializedJob
export const SerializedJobSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  data: z.unknown(),
  opts: z.unknown(),
  progress: JobProgressSchema,
  attemptsMade: z.number().int().nonnegative(),
  failedReason: z.string().optional(),
  stacktrace: z.array(z.string()).optional(),
  timestamp: z.number().optional(),
  processedOn: z.number().optional(),
  finishedOn: z.number().optional(),
});

// --- Tipos Inferidos do Zod ---
export type QueueStats = z.infer<typeof QueueStatsSchema>;
export type JobProgress = z.infer<typeof JobProgressSchema>;
export type SerializedJob = z.infer<typeof SerializedJobSchema>;
