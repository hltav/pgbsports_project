import { IMonthlySnapshotProcessor } from './../../../../libs/services/queue/workers/heavyJobs.worker';
import { BankrollMonthlySnapshotJob } from '../bankrollMonthlySnapshot.job';

export class MonthlySnapshotProcessor implements IMonthlySnapshotProcessor {
  constructor(private readonly job: BankrollMonthlySnapshotJob) {}

  async processMonthlySnapshot(year: number, month: number): Promise<void> {
    return this.job.processMonthlySnapshot(year, month);
  }
}
