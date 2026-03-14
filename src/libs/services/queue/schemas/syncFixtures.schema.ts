import { z } from 'zod';

export const SyncFixtureJobDataSchema = z.object({
  apiSportsEventId: z.string(),
});

export type SyncFixtureJobData = z.infer<typeof SyncFixtureJobDataSchema>;

export const SyncFixtureJobResultSchema = z.object({
  apiSportsEventId: z.string(),
  isFinished: z.boolean(),
});

export type SyncFixtureJobResult = z.infer<typeof SyncFixtureJobResultSchema>;
