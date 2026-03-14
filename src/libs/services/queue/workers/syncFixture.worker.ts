import { Worker, Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { redisConnection } from '../redis.connection';
import { ApiSportsSyncService } from '../../../../modules/matchs/services/apiSportsSynk.service';
import { SYNC_FIXTURES_QUEUE } from '../queues/syncFixture.queue';
import {
  SyncFixtureJobData,
  SyncFixtureJobResult,
} from '../schemas/syncFixtures.schema';
// ajuste o path

export type { SyncFixtureJobData, SyncFixtureJobResult };

export function createSyncFixtureWorker(
  apiSportsSyncService: ApiSportsSyncService,
): Worker<SyncFixtureJobData, SyncFixtureJobResult> {
  const logger = new Logger('SyncFixtureWorker');

  const worker = new Worker<SyncFixtureJobData, SyncFixtureJobResult>(
    SYNC_FIXTURES_QUEUE,
    async (job: Job<SyncFixtureJobData>) => {
      const { apiSportsEventId } = job.data;

      logger.log(
        `⚙️  Processing fixture ${apiSportsEventId} | attempt ${job.attemptsMade + 1}`,
      );

      const isFinished =
        await apiSportsSyncService.syncFixtureById(apiSportsEventId);

      logger.log(
        `✅ Fixture ${apiSportsEventId} → ${isFinished ? 'FINISHED' : 'PENDING'}`,
      );

      return { apiSportsEventId, isFinished };
    },
    {
      connection: redisConnection,
      concurrency: 5, // 5 partidas em paralelo
      limiter: {
        max: 10, // máximo 10 jobs
        duration: 1000, // por segundo → respeita quota da API
      },
    },
  );

  // Eventos de ciclo de vida do worker
  worker.on('completed', (job, result) => {
    logger.log(`🏁 Job ${job.id} completed | finished=${result.isFinished}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`❌ Job ${job?.id} failed | ${err.message}`);
  });

  worker.on('error', (err) => {
    logger.error(`🔥 Worker error: ${err.message}`);
  });

  return worker;
}
