import { Worker, Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { redisConnection } from '../redis.connection';
import {
  HEAVY_JOBS_QUEUE,
  JOB_HOURLY_SNAPSHOT,
  JOB_DAILY_SNAPSHOT,
  JOB_WEEKLY_SNAPSHOT,
  JOB_MONTHLY_SNAPSHOT,
  JOB_YEARLY_SNAPSHOT,
} from '../constants/queue.constants';
import {
  HeavyJobData,
  HourlySnapshotJobData,
  DailySnapshotJobData,
  WeeklySnapshotJobData,
  MonthlySnapshotJobData,
  YearlySnapshotJobData,
} from '../schemas/jobsTypes.schema';

// Interfaces dos serviços para evitar import circular
export interface IHourlySnapshotProcessor {
  processBucket(bucketStart: Date, start: Date, end: Date): Promise<void>;
}

export interface IDailySnapshotProcessor {
  processDailySnapshot(date: Date): Promise<void>;
}

export interface IWeeklySnapshotProcessor {
  processWeeklySnapshot(year: number, week: number): Promise<void>;
}

export interface IMonthlySnapshotProcessor {
  processMonthlySnapshot(year: number, month: number): Promise<void>;
}

export interface IYearlySnapshotProcessor {
  processYearlySnapshot(year: number): Promise<void>;
}

export function createHeavyJobsWorker(services: {
  hourlySnapshotProcessor: IHourlySnapshotProcessor;
  dailySnapshotProcessor: IDailySnapshotProcessor;
  weeklySnapshotProcessor: IWeeklySnapshotProcessor;
  monthlySnapshotProcessor: IMonthlySnapshotProcessor;
  yearlySnapshotProcessor: IYearlySnapshotProcessor;
}): Worker<HeavyJobData> {
  const logger = new Logger('HeavyJobsWorker');

  const worker = new Worker<HeavyJobData>(
    HEAVY_JOBS_QUEUE,
    async (job: Job<HeavyJobData>) => {
      switch (job.name) {
        case JOB_HOURLY_SNAPSHOT: {
          const { bucketStart, start, end } = job.data as HourlySnapshotJobData;
          logger.log(`⚙️  hourly-snapshot | bucket=${bucketStart}`);
          return services.hourlySnapshotProcessor.processBucket(
            new Date(bucketStart),
            new Date(start),
            new Date(end),
          );
        }

        case JOB_DAILY_SNAPSHOT: {
          const { date } = job.data as DailySnapshotJobData;
          logger.log(`⚙️  daily-snapshot | date=${date}`);
          return services.dailySnapshotProcessor.processDailySnapshot(
            new Date(date),
          );
        }

        case JOB_WEEKLY_SNAPSHOT: {
          const { year, week } = job.data as WeeklySnapshotJobData;
          logger.log(`⚙️  weekly-snapshot | ${week}/${year}`);
          return services.weeklySnapshotProcessor.processWeeklySnapshot(
            year,
            week,
          );
        }

        case JOB_MONTHLY_SNAPSHOT: {
          const { year, month } = job.data as MonthlySnapshotJobData;
          logger.log(`⚙️  monthly-snapshot | ${month}/${year}`);
          return services.monthlySnapshotProcessor.processMonthlySnapshot(
            year,
            month,
          );
        }

        case JOB_YEARLY_SNAPSHOT: {
          const { year } = job.data as YearlySnapshotJobData;
          logger.log(`⚙️  yearly-snapshot | ${year}`);
          return services.yearlySnapshotProcessor.processYearlySnapshot(year);
        }

        default:
          logger.warn(`⚠️  Unknown job name: ${job.name}`);
      }
    },
    {
      connection: redisConnection,
      concurrency: 1, // snapshots são pesados — apenas 1 por vez
    },
  );

  worker.on('completed', (job) => {
    logger.log(`✅ ${job.name} | jobId=${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`❌ ${job?.name} | jobId=${job?.id} failed | ${err.message}`);
  });

  worker.on('error', (err) => {
    logger.error(`🔥 HeavyJobsWorker error: ${err.message}`);
  });

  return worker;
}
