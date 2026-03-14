import { EarlyWinnerUpdateService } from './../../../../shared/results/services/bet-settlement/orchestrator/earlyWinnerUpdater.service';
import { IEarlyWinnerProcessor } from '../workers/frequentJobs.worker';

export class EarlyWinnerProcessor implements IEarlyWinnerProcessor {
  constructor(private readonly service: EarlyWinnerUpdateService) {}

  async processEarlyWinnerGroup(
    key: string,
    betIds: number[],
  ): Promise<number> {
    return this.service.processEarlyWinnerGroupByIds(key, betIds);
  }
}
