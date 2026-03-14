import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Worker } from 'bullmq';
import { FREQUENT_JOBS_QUEUE } from './../../../../libs/services/queue/constants/queue.constants';
import { createFrequentJobsWorker } from '../../../../libs/services/queue/workers/frequentJobs.worker';
import { EarlyWinnerUpdateService } from '../bet-settlement/orchestrator/earlyWinnerUpdater.service';
import { EventBatchProcessorService } from '../bet-settlement/orchestrator/eventBatchProcessor.service';

@Injectable()
export class ResultsFrequentWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ResultsFrequentWorker.name);
  private worker?: Worker;

  constructor(
    private readonly eventBatch: EventBatchProcessorService,
    private readonly earlyWinner: EarlyWinnerUpdateService,
  ) {}

  onModuleInit() {
    // evita subir 2x se acontecer hot-reload estranho
    if (this.worker) return;

    this.worker = createFrequentJobsWorker({
      eventBatchProcessor: {
        processEventBatch: (eventKey, betIds) =>
          this.eventBatch.processEventBatchByIds(eventKey, betIds),
      },
      earlyWinnerProcessor: {
        processEarlyWinnerGroup: (key, betIds) =>
          this.earlyWinner.processEarlyWinnerGroupByIds(key, betIds),
      },
    });

    this.logger.log(
      `🚀 Results frequent worker started: ${FREQUENT_JOBS_QUEUE}`,
    );
  }

  async onModuleDestroy() {
    await this.worker?.close();
    this.worker = undefined;
    this.logger.log('🛑 Results frequent worker stopped');
  }
}
