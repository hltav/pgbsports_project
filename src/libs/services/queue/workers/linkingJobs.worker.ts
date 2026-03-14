import { Worker, Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { redisConnection } from '../redis.connection';
import { LINKING_JOBS_QUEUE, JOB_LINK_BET } from '../constants/queue.constants';
import { LinkBetJobData } from '../schemas/jobsTypes.schema';

export interface IMatchLinkingProcessor {
  linkBetToMatchById(betId: number): Promise<void>;
}

export function createLinkingJobsWorker(services: {
  matchLinkingProcessor: IMatchLinkingProcessor;
}): Worker<LinkBetJobData> {
  const logger = new Logger('LinkingJobsWorker');

  const worker = new Worker<LinkBetJobData>(
    LINKING_JOBS_QUEUE,
    async (job: Job<LinkBetJobData>) => {
      if (job.name !== JOB_LINK_BET) {
        logger.warn(`⚠️ Unknown job name: ${job.name}`);
        return;
      }

      const { betId } = job.data;
      logger.debug(`⚙️ link-bet | betId=${betId}`);
      return services.matchLinkingProcessor.linkBetToMatchById(betId);
    },
    { connection: redisConnection, concurrency: 2 },
  );

  return worker;
}
