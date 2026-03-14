import { EventBatchProcessorService } from './../../../../shared/results/services/bet-settlement/orchestrator/eventBatchProcessor.service';
import { IEventBatchProcessor } from '../workers/frequentJobs.worker';

export class EventBatchProcessor implements IEventBatchProcessor {
  constructor(private readonly service: EventBatchProcessorService) {}

  async processEventBatch(
    eventKey: string,
    betIds: number[],
  ): Promise<unknown> {
    return this.service.processEventBatchByIds(eventKey, betIds);
  }
}
