import { IDailySnapshotProcessor } from './../../../../libs/services/queue/workers/heavyJobs.worker';
import { BankrollDailySnapshotJob } from '../bankrollDailySnapshot.job';

export class DailySnapshotProcessor implements IDailySnapshotProcessor {
  constructor(private readonly job: BankrollDailySnapshotJob) {}

  async processDailySnapshot(): Promise<void> {
    return this.job.processDailySnapshot();
  }
}
