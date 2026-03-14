// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { startWorkers } from './workers/bootstrapWorkers';
// import { HourlySnapshotProcessor } from './../../../modules/bankroll/jobs/processors/hourlySnapshot.processor';
// import { ApiSportsSyncService } from './../../../modules/matchs/services/apiSportsSynk.service';
// import { DailySnapshotProcessor } from './../../../modules/bankroll/jobs/processors/dailySnapshot.processor';
// import { WeeklySnapshotProcessor } from './../../../modules/bankroll/jobs/processors/weeklySnapshot.processor';
// import { YearlySnapshotProcessor } from './../../../modules/bankroll/jobs/processors/yearlySnapshot.processor';
// import { MonthlySnapshotProcessor } from './../../../modules/bankroll/jobs/processors/monthySnapshotClass.processor';
// import { EarlyWinnerProcessor } from './processors/earlyWinner.processor';
// import { EventBatchProcessor } from './processors/eventBatch.processor';
// import { MatchLinkingProcessor } from './processors/matchLinking.processor';

// @Injectable()
// export class WorkerBootstrapService implements OnModuleInit {
//   constructor(
//     private readonly hourlySnapshot: HourlySnapshotProcessor,
//     private readonly dailySnapshot: DailySnapshotProcessor,
//     private readonly weeklySnapshot: WeeklySnapshotProcessor,
//     private readonly monthlySnapshot: MonthlySnapshotProcessor,
//     private readonly yearlySnapshot: YearlySnapshotProcessor,

//     private readonly eventBatchProcessor: EventBatchProcessor,
//     private readonly earlyWinnerProcessor: EarlyWinnerProcessor,

//     private readonly matchLinkingProcessor: MatchLinkingProcessor,

//     private readonly apiSportsSyncService: ApiSportsSyncService,
//   ) {}

//   onModuleInit() {
//     startWorkers({
//       hourlySnapshotProcessor: this.hourlySnapshot,
//       dailySnapshotProcessor: this.dailySnapshot,
//       weeklySnapshotProcessor: this.weeklySnapshot,
//       monthlySnapshotProcessor: this.monthlySnapshot,
//       yearlySnapshotProcessor: this.yearlySnapshot,

//       eventBatchProcessor: this.eventBatchProcessor,
//       earlyWinnerProcessor: this.earlyWinnerProcessor,

//       matchLinkingProcessor: this.matchLinkingProcessor,

//       apiSportsSyncService: this.apiSportsSyncService,
//     });
//   }
// }

import { Injectable, OnModuleInit } from '@nestjs/common';
import { startWorkers } from './bootstrapWorkers';
// Jobs (snapshot)
import { BankrollHourlySnapshotJob } from '../../../../modules/bankroll/jobs/bankrollHourlySnapshot.job';
import { BankrollDailySnapshotJob } from '../../../../modules/bankroll/jobs/bankrollDailySnapshot.job';
import { BankrollWeeklySnapshotJob } from '../../../../modules/bankroll/jobs/bankrollWeeklySnapshot.job';
import { BankrollMonthlySnapshotJob } from '../../../../modules/bankroll/jobs/bankrollMonthlySnapshot.job';
import { BankrollYearlySnapshotJob } from '../../../../modules/bankroll/jobs/bankrollYearlySnapshot.job';
// Processors (snapshot) — instanciados manualmente
import { HourlySnapshotProcessor } from '../../../../modules/bankroll/jobs/processors/hourlySnapshot.processor';
import { DailySnapshotProcessor } from '../../../../modules/bankroll/jobs/processors/dailySnapshot.processor';
import { WeeklySnapshotProcessor } from '../../../../modules/bankroll/jobs/processors/weeklySnapshot.processor';
import { MonthlySnapshotProcessor } from '../../../../modules/bankroll/jobs/processors/monthySnapshotClass.processor';
import { YearlySnapshotProcessor } from '../../../../modules/bankroll/jobs/processors/yearlySnapshot.processor';
// Serviços reais (frequent jobs)
import { ApiSportsSyncService } from '../../../../modules/matchs/services/apiSportsSynk.service';
import { EventBatchProcessorService } from 'src/shared/results/services/bet-settlement/orchestrator/eventBatchProcessor.service';
import { EarlyWinnerUpdateService } from 'src/shared/results/services/bet-settlement/orchestrator/earlyWinnerUpdater.service';
import { MatchLinkingService } from 'src/modules/match-linking/services/matchLinking.service';
// Processors (frequent jobs) — instanciados manualmente
import { EventBatchProcessor } from '../processors/eventBatch.processor';
import { EarlyWinnerProcessor } from '../processors/earlyWinner.processor';
import { MatchLinkingProcessor } from '../processors/matchLinking.processor';

@Injectable()
export class WorkerBootstrapService implements OnModuleInit {
  constructor(
    // Snapshot jobs
    private readonly hourlySnapshotJob: BankrollHourlySnapshotJob,
    private readonly dailySnapshotJob: BankrollDailySnapshotJob,
    private readonly weeklySnapshotJob: BankrollWeeklySnapshotJob,
    private readonly monthlySnapshotJob: BankrollMonthlySnapshotJob,
    private readonly yearlySnapshotJob: BankrollYearlySnapshotJob,

    // Frequent job services
    private readonly eventBatchService: EventBatchProcessorService,
    private readonly earlyWinnerService: EarlyWinnerUpdateService,
    private readonly matchLinkingService: MatchLinkingService,

    private readonly apiSportsSyncService: ApiSportsSyncService,
  ) {}

  onModuleInit() {
    startWorkers({
      hourlySnapshotProcessor: new HourlySnapshotProcessor(
        this.hourlySnapshotJob,
      ),
      dailySnapshotProcessor: new DailySnapshotProcessor(this.dailySnapshotJob),
      weeklySnapshotProcessor: new WeeklySnapshotProcessor(
        this.weeklySnapshotJob,
      ),
      monthlySnapshotProcessor: new MonthlySnapshotProcessor(
        this.monthlySnapshotJob,
      ),
      yearlySnapshotProcessor: new YearlySnapshotProcessor(
        this.yearlySnapshotJob,
      ),

      eventBatchProcessor: new EventBatchProcessor(this.eventBatchService),
      earlyWinnerProcessor: new EarlyWinnerProcessor(this.earlyWinnerService),
      matchLinkingProcessor: new MatchLinkingProcessor(
        this.matchLinkingService,
      ),

      apiSportsSyncService: this.apiSportsSyncService,
    });
  }
}
