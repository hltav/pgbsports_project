import { IWeeklySnapshotProcessor } from './../../../../libs/services/queue/workers/heavyJobs.worker';
import { BankrollWeeklySnapshotJob } from '../bankrollWeeklySnapshot.job';

export class WeeklySnapshotProcessor implements IWeeklySnapshotProcessor {
  constructor(private readonly job: BankrollWeeklySnapshotJob) {}

  async processWeeklySnapshot(year: number, week: number): Promise<void> {
    return this.job.processWeeklySnapshot(year, week);
  }
}
