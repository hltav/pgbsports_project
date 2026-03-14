import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Queue, Job } from 'bullmq';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from './../../../libs/database';
import {
  FREQUENT_JOBS_QUEUE,
  HEAVY_JOBS_QUEUE,
  LINKING_JOBS_QUEUE,
  JOB_SETTLE_EVENT,
  JOB_EARLY_WINNER_EVENT,
  JOB_LINK_BET,
  JOB_HOURLY_SNAPSHOT,
  JOB_DAILY_SNAPSHOT,
  JOB_WEEKLY_SNAPSHOT,
  JOB_MONTHLY_SNAPSHOT,
  JOB_YEARLY_SNAPSHOT,
  SYNC_FIXTURES_QUEUE,
} from './constants/queue.constants';
import { frequentJobsQueue } from './queues/frequentJobs.queue';
import { heavyJobsQueue } from './queues/heavyJobs.queue';
import { linkingJobsQueue } from './queues/linkingJobs.queue';
import { syncFixturesQueue } from './queues/syncFixture.queue';
import {
  EarlyWinnerEventJobData,
  HourlySnapshotJobData,
  LinkBetJobData,
  SettleEventJobData,
  SyncFixtureJobData,
} from './schemas/jobsTypes.schema';
import { QueueStats, SerializedJob } from './schemas/queueStats.schema';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  private readonly queues: Record<string, Queue<any>> = {
    [FREQUENT_JOBS_QUEUE]: frequentJobsQueue,
    [LINKING_JOBS_QUEUE]: linkingJobsQueue,
    [HEAVY_JOBS_QUEUE]: heavyJobsQueue,
    [SYNC_FIXTURES_QUEUE]: syncFixturesQueue,
  };

  private readonly adminQueueNameMap: Record<string, string> = {
    frequent: FREQUENT_JOBS_QUEUE,
    linking: LINKING_JOBS_QUEUE,
    heavy: HEAVY_JOBS_QUEUE,
    sync: 'syncFixtures',
  };

  private readonly internalToAdminMap: Record<string, string> = {
    [FREQUENT_JOBS_QUEUE]: 'frequent',
    [LINKING_JOBS_QUEUE]: 'linking',
    [HEAVY_JOBS_QUEUE]: 'heavy',
    [SYNC_FIXTURES_QUEUE]: 'sync',
  };

  constructor(private readonly prisma: PrismaService) {}

  // ENQUEUE
  async enqueueSettleEvent(
    eventKey: string,
    betIds: number[],
  ): Promise<string> {
    const job = await frequentJobsQueue.add(
      JOB_SETTLE_EVENT,
      { eventKey, betIds } satisfies SettleEventJobData,
      { jobId: `settle-${eventKey}` },
    );
    return job.id!;
  }

  async enqueueSettleBatch(
    eventMap: Map<string, number[]>,
  ): Promise<{ queued: number }> {
    const jobs = await frequentJobsQueue.addBulk(
      Array.from(eventMap.entries()).map(([eventKey, betIds]) => ({
        name: JOB_SETTLE_EVENT,
        data: { eventKey, betIds } satisfies SettleEventJobData,
        opts: {
          jobId: `settle-${eventKey}`,
          removeOnComplete: true,
          removeOnFail: true,
        },
      })),
    );
    return { queued: jobs.length };
  }

  async enqueueEarlyWinnerBatch(
    keyMap: Map<string, number[]>,
  ): Promise<{ queued: number }> {
    const jobs = await frequentJobsQueue.addBulk(
      Array.from(keyMap.entries()).map(([key, betIds]) => ({
        name: JOB_EARLY_WINNER_EVENT,
        data: { key, betIds } satisfies EarlyWinnerEventJobData,
        opts: {
          jobId: `early-winner-${key}`,
          priority: 1,
        },
      })),
    );
    return { queued: jobs.length };
  }

  async enqueueLinkBetBatch(betIds: number[]): Promise<{ queued: number }> {
    const jobs = await linkingJobsQueue.addBulk(
      betIds.map((betId) => ({
        name: JOB_LINK_BET,
        data: { betId } satisfies LinkBetJobData,
        opts: { jobId: `link-bet-${betId}` },
      })),
    );
    return { queued: jobs.length };
  }

  async enqueueFixture(apiSportsEventId: string): Promise<string> {
    const priority = await this.getFixturePriority(apiSportsEventId);

    const job = await syncFixturesQueue.add(
      'sync-fixture',
      { apiSportsEventId } satisfies SyncFixtureJobData,
      { jobId: `fixture-${apiSportsEventId}`, priority },
    );

    return job.id!;
  }

  async enqueueFixtureBatch(
    apiSportsEventIds: string[],
  ): Promise<{ queued: number; jobIds: string[] }> {
    const jobs = await Promise.all(
      apiSportsEventIds.map(async (eventId) => {
        const priority = await this.getFixturePriority(eventId);

        const job = await syncFixturesQueue.add(
          'sync-fixture',
          { apiSportsEventId: eventId } satisfies SyncFixtureJobData,
          {
            jobId: `fixture-${eventId}`,
            priority,
          },
        );

        return job.id!;
      }),
    );

    return {
      queued: jobs.length,
      jobIds: jobs,
    };
  }

  async enqueueHourlyBuckets(
    buckets: HourlySnapshotJobData[],
  ): Promise<{ queued: number }> {
    const jobs = await heavyJobsQueue.addBulk(
      buckets.map((b) => ({
        name: JOB_HOURLY_SNAPSHOT,
        data: b,
        opts: {
          jobId: `hourly-${b.bucketStart}`,
          priority: 1,
        },
      })),
    );
    return { queued: jobs.length };
  }

  async enqueueDailySnapshot(date: Date): Promise<void> {
    await heavyJobsQueue.add(
      JOB_DAILY_SNAPSHOT,
      { date: date.toISOString() },
      { jobId: `daily-${date.toISOString().split('T')[0]}` },
    );
  }

  async enqueueWeeklySnapshot(year: number, week: number): Promise<void> {
    await heavyJobsQueue.add(
      JOB_WEEKLY_SNAPSHOT,
      { year, week },
      { jobId: `weekly-${year}-${week}` },
    );
  }

  async enqueueMonthlySnapshot(year: number, month: number): Promise<void> {
    await heavyJobsQueue.add(
      JOB_MONTHLY_SNAPSHOT,
      { year, month },
      { jobId: `monthly-${year}-${month}` },
    );
  }

  async enqueueYearlySnapshot(year: number): Promise<void> {
    await heavyJobsQueue.add(
      JOB_YEARLY_SNAPSHOT,
      { year },
      { jobId: `yearly-${year}` },
    );
  }

  // ADMIN / MONITORAMENTO
  async getAllQueuesStats(): Promise<Record<string, QueueStats>> {
    const entries = await Promise.all(
      Object.entries(this.queues).map(async ([internalName, queue]) => {
        const [waiting, active, failed, completed, delayed] = await Promise.all(
          [
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getFailedCount(),
            queue.getCompletedCount(),
            queue.getDelayedCount(),
          ],
        );

        const adminName = this.internalToAdminMap[internalName] ?? internalName;
        return [
          adminName,
          { waiting, active, failed, completed, delayed },
        ] as const;
      }),
    );

    return Object.fromEntries(entries);
  }

  async getJobs(
    queueName: string,
    status: 'waiting' | 'active' | 'failed' | 'completed' | 'delayed',
    start = 0,
    end = 50,
  ) {
    const queue = this.getQueue(queueName);
    const jobs = await queue.getJobs([status], start, end);

    return jobs.map((job) => this.serializeJob(job));
  }

  async getJobDetails(queueName: string, jobId: string) {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) throw new NotFoundException('Job não encontrado');

    return this.serializeJob(job);
  }

  async retryJob(queueName: string, jobId: string) {
    const job = await this.getJob(queueName, jobId);
    await job.retry();
    return { status: 'retried' };
  }

  async removeJob(queueName: string, jobId: string) {
    const job = await this.getJob(queueName, jobId);
    await job.remove();
    return { status: 'removed' };
  }

  async pauseQueue(queueName: string) {
    await this.getQueue(queueName).pause();
    return { status: 'paused' };
  }

  async resumeQueue(queueName: string) {
    await this.getQueue(queueName).resume();
    return { status: 'resumed' };
  }

  async isPaused(queueName: string) {
    return this.getQueue(queueName).isPaused();
  }

  // HELPERS
  // private getQueue(name: string): Queue {
  //   const queue = this.queues[name];
  //   if (!queue) throw new NotFoundException('Fila não encontrada');
  //   return queue;
  // }

  private getQueue(name: string): Queue {
    const internalName = this.adminQueueNameMap[name] ?? name; // fallback pro próprio nome
    const queue = this.queues[internalName];
    if (!queue) throw new NotFoundException('Fila não encontrada');
    return queue;
  }

  private async getJob(queueName: string, jobId: string): Promise<Job> {
    const job = await this.getQueue(queueName).getJob(jobId);
    if (!job) throw new NotFoundException('Job não encontrado');
    return job;
  }

  private serializeJob(job: Job<unknown, unknown, string>): SerializedJob {
    return {
      id: job.id!,
      name: job.name,
      data: job.data,
      opts: job.opts,
      progress: job.progress,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      stacktrace: job.stacktrace,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }

  private async getFixturePriority(eventId: string): Promise<number> {
    const match = await this.prisma.externalMatch.findUnique({
      where: { apiSportsEventId: eventId },
      select: { status: true },
    });

    return match?.status === MatchStatus.LIVE ? 1 : 10;
  }
}
