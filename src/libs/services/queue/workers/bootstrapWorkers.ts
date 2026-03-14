import { ApiSportsSyncService } from 'src/modules/matchs/services/apiSportsSynk.service';
import {
  createFrequentJobsWorker,
  IEarlyWinnerProcessor,
  IEventBatchProcessor,
  IMatchLinkingProcessor,
} from './frequentJobs.worker';
import {
  createHeavyJobsWorker,
  IDailySnapshotProcessor,
  IHourlySnapshotProcessor,
  IMonthlySnapshotProcessor,
  IWeeklySnapshotProcessor,
  IYearlySnapshotProcessor,
} from './heavyJobs.worker';
import { createLinkingJobsWorker } from './linkingJobs.worker';
import { createSyncFixtureWorker } from './syncFixture.worker';

type WorkerServices = {
  hourlySnapshotProcessor: IHourlySnapshotProcessor;
  dailySnapshotProcessor: IDailySnapshotProcessor;
  weeklySnapshotProcessor: IWeeklySnapshotProcessor;
  monthlySnapshotProcessor: IMonthlySnapshotProcessor;
  yearlySnapshotProcessor: IYearlySnapshotProcessor;

  eventBatchProcessor: IEventBatchProcessor;
  earlyWinnerProcessor: IEarlyWinnerProcessor;

  matchLinkingProcessor: IMatchLinkingProcessor;

  apiSportsSyncService: ApiSportsSyncService;
};

export function startWorkers(services: WorkerServices) {
  createHeavyJobsWorker(services);

  createFrequentJobsWorker({
    eventBatchProcessor: services.eventBatchProcessor,
    earlyWinnerProcessor: services.earlyWinnerProcessor,
    matchLinkingProcessor: services.matchLinkingProcessor,
  });

  createLinkingJobsWorker({
    matchLinkingProcessor: services.matchLinkingProcessor,
  });

  createSyncFixtureWorker(services.apiSportsSyncService);
}
