import { Queue } from 'bullmq';
import { redisConnection } from '../redis.connection';
import { FrequentJobData } from '../schemas/jobsTypes.schema';
import { FREQUENT_JOBS_QUEUE } from '../constants/queue.constants';

export const frequentJobsQueue = new Queue<FrequentJobData>(
  FREQUENT_JOBS_QUEUE,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 200,
      removeOnFail: 500,
    },
  },
);
