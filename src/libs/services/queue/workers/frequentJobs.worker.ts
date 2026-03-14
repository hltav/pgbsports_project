import { Worker, Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { redisConnection } from '../redis.connection';
import {
  EarlyWinnerEventJobData,
  FrequentJobData,
  LinkBetJobData,
  SettleEventJobData,
} from '../schemas/jobsTypes.schema';
import {
  FREQUENT_JOBS_QUEUE,
  JOB_SETTLE_EVENT,
  JOB_EARLY_WINNER_EVENT,
  JOB_LINK_BET,
} from '../constants/queue.constants';

// Interfaces dos serviços para evitar import circular
export interface IEventBatchProcessor {
  processEventBatch(eventKey: string, betIds: number[]): Promise<unknown>;
}

export interface IEarlyWinnerProcessor {
  processEarlyWinnerGroup(key: string, betIds: number[]): Promise<number>;
}

export interface IMatchLinkingProcessor {
  linkBetToMatchById(betId: number): Promise<void>;
}

export function createFrequentJobsWorker(services: {
  eventBatchProcessor: IEventBatchProcessor;
  earlyWinnerProcessor: IEarlyWinnerProcessor;
  matchLinkingProcessor?: IMatchLinkingProcessor;
}): Worker<FrequentJobData> {
  const logger = new Logger('FrequentJobsWorker');

  const worker = new Worker<FrequentJobData>(
    FREQUENT_JOBS_QUEUE,
    async (job: Job<FrequentJobData>) => {
      logger.log(`📥 JOB RECEIVED | name=${job.name}`);
      switch (job.name) {
        case JOB_SETTLE_EVENT: {
          const { eventKey, betIds } = job.data as SettleEventJobData;
          logger.debug(
            `⚙️  settle-event | key=${eventKey} | bets=${betIds.length}`,
          );
          return services.eventBatchProcessor.processEventBatch(
            eventKey,
            betIds,
          );
        }

        case JOB_EARLY_WINNER_EVENT: {
          const { key, betIds } = job.data as EarlyWinnerEventJobData;
          logger.debug(`⚙️  early-winner | key=${key} | bets=${betIds.length}`);
          return services.earlyWinnerProcessor.processEarlyWinnerGroup(
            key,
            betIds,
          );
        }

        case JOB_LINK_BET: {
          if (!services.matchLinkingProcessor) {
            logger.error(
              `❌ link-bet received but matchLinkingProcessor is not configured | jobId=${job.id}`,
            );
            throw new Error(
              'matchLinkingProcessor not configured for JOB_LINK_BET',
            );
          }

          const { betId } = job.data as LinkBetJobData;
          logger.debug(`⚙️  link-bet | betId=${betId}`);
          return services.matchLinkingProcessor.linkBetToMatchById(betId);
        }

        default:
          logger.warn(`⚠️  Unknown job name: ${job.name}`);
      }
    },
    {
      connection: redisConnection,
      concurrency: 2, // settle-event e early-winner podem rodar juntos
      limiter: {
        max: 20,
        duration: 1000,
      },
    },
  );

  worker.on('ready', () => {
    logger.log('🟢 Worker connected to Redis');
  });

  worker.on('completed', (job) => {
    logger.debug(`✅ ${job.name} | jobId=${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`❌ ${job?.name} | jobId=${job?.id} failed | ${err.message}`);
  });

  worker.on('error', (err) => {
    logger.error(`🔥 FrequentJobsWorker error: ${err.message}`);
  });

  return worker;
}
