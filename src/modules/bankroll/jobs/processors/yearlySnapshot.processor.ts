import { IYearlySnapshotProcessor } from './../../../../libs/services/queue/workers/heavyJobs.worker';
import { BankrollYearlySnapshotJob } from '../bankrollYearlySnapshot.job';

export class YearlySnapshotProcessor implements IYearlySnapshotProcessor {
  constructor(private readonly job: BankrollYearlySnapshotJob) {}

  async processYearlySnapshot(year: number): Promise<void> {
    return this.job.processYearlySnapshot(year);
  }
}
