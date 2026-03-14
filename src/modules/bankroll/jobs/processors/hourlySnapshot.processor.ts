import { IHourlySnapshotProcessor } from './../../../../libs/services/queue/workers/heavyJobs.worker';
import { BankrollHourlySnapshotJob } from '../bankrollHourlySnapshot.job';

export class HourlySnapshotProcessor implements IHourlySnapshotProcessor {
  constructor(private readonly job: BankrollHourlySnapshotJob) {}

  async processBucket(
    bucketStart: Date,
    start: Date,
    end: Date,
  ): Promise<void> {
    return this.job.processBucket(bucketStart, start, end);
  }
}
