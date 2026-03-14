import { Queue } from 'bullmq';
import { redisConnection } from '../redis.connection';
import { SyncFixtureJobData } from '../schemas/syncFixtures.schema';

export const SYNC_FIXTURES_QUEUE = 'sync-fixtures';

export const syncFixturesQueue = new Queue<SyncFixtureJobData>(
  SYNC_FIXTURES_QUEUE,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000, // 2s → 4s → 8s
      },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  },
);
