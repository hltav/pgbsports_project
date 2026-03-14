import { Module } from '@nestjs/common';
import { PrismaService } from './../../../libs/database';
import { BankrollDailySnapshotService } from '../snapshots/services/bankrollDailySnapshot.service';
import { BankrollDailySnapshotJob } from './bankrollDailySnapshot.job';
import { BankrollMonthlySnapshotService } from '../snapshots/services/bankrollMonthlySnapshot.service';
import { BankrollMonthlySnapshotJob } from './bankrollMonthlySnapshot.job';
import { BankrollWeeklySnapshotService } from '../snapshots/services/bankrollWeeklySnapshot.service';
import { BankrollWeeklySnapshotJob } from './bankrollWeeklySnapshot.job';
import { BankrollYearlySnapshotService } from '../snapshots/services/bankrollYearlySnapshot.service';
import { BankrollYearlySnapshotJob } from './bankrollYearlySnapshot.job';
import { BankrollHourlySnapshotJob } from './bankrollHourlySnapshot.job';
import { BankrollHourlySnapshotService } from '../snapshots/services/bankrollHourlySnapshot.service';
import { QueueModule } from './../../../libs/services/queue/queue.module';

@Module({
  imports: [QueueModule],
  providers: [
    BankrollHourlySnapshotJob,
    BankrollDailySnapshotJob,
    BankrollWeeklySnapshotJob,
    BankrollMonthlySnapshotJob,
    BankrollYearlySnapshotJob,
    BankrollHourlySnapshotService,
    BankrollDailySnapshotService,
    BankrollWeeklySnapshotService,
    BankrollMonthlySnapshotService,
    BankrollYearlySnapshotService,
    PrismaService,
  ],
  controllers: [],
  exports: [
    BankrollHourlySnapshotJob,
    BankrollDailySnapshotJob,
    BankrollWeeklySnapshotJob,
    BankrollMonthlySnapshotJob,
    BankrollYearlySnapshotJob,
    BankrollHourlySnapshotService,
    BankrollDailySnapshotService,
    BankrollWeeklySnapshotService,
    BankrollMonthlySnapshotService,
    BankrollYearlySnapshotService,
  ],
})
export class JobsBankrollModule {}
