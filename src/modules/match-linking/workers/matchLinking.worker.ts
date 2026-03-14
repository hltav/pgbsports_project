import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Worker } from 'bullmq';
import { MatchLinkingService } from '../services/matchLinking.service';
import { LINKING_JOBS_QUEUE } from './../../../libs/services/queue/constants/queue.constants';
import { createLinkingJobsWorker } from './../../../libs/services/queue/workers/linkingJobs.worker';

@Injectable()
export class MatchLinkingWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MatchLinkingWorker.name);
  private worker?: Worker;

  constructor(private readonly matchLinking: MatchLinkingService) {}

  onModuleInit() {
    this.worker = createLinkingJobsWorker({
      matchLinkingProcessor: {
        linkBetToMatchById: (betId) =>
          this.matchLinking.linkBetToMatchById(betId),
      },
    });

    this.logger.log(`🚀 MatchLinking worker started: ${LINKING_JOBS_QUEUE}`);
  }

  async onModuleDestroy() {
    await this.worker?.close();
    this.logger.log('🛑 MatchLinking worker stopped');
  }
}
