import { Queue } from 'bullmq';
import { redisConnection } from '../redis.connection';
import { LINKING_JOBS_QUEUE } from '../constants/queue.constants';
import { LinkBetJobData } from '../schemas/jobsTypes.schema';

export const linkingJobsQueue = new Queue<LinkBetJobData>(LINKING_JOBS_QUEUE, {
  connection: redisConnection,
});
