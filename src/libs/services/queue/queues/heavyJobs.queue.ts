import { Queue } from 'bullmq';
import { redisConnection } from '../redis.connection';
import { HEAVY_JOBS_QUEUE } from '../constants/queue.constants';
import { HeavyJobData } from '../schemas/jobsTypes.schema';

export const heavyJobsQueue = new Queue<HeavyJobData>(HEAVY_JOBS_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});
