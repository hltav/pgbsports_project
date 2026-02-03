import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from '../../../libs/database/prisma';
import { BankrollDailySnapshotService } from './services/bankrollDailySnapshot.service';
import { BankrollMonthlySnapshotService } from './services/bankrollMonthlySnapshot.service';
import { BankrollWeeklySnapshotService } from './services/bankrollWeeklySnapshot.service';
import { BankrollYearlySnapshotService } from './services/bankrollYearlySnapshot.service';
import { BankrollDailySnapshotController } from './controllers/bankrollDailySnapshot.controller';
import { BankrollMonthlySnapshotController } from './controllers/bankrollMonthlySnapshot.controller';
import { BankrollWeeklySnapshotController } from './controllers/bankrollWeeklySnapshot.controller';
import { BankrollYearlySnapshotController } from './controllers/bankrollYearlySnapshot.controller';
import { BankrollHourlySnapshotController } from './controllers/bankrollHourlySnapshot.controller';
import { BankrollHourlySnapshotService } from './services/bankrollHourlySnapshot.service';

@Module({
  imports: [PrismaModule],
  providers: [
    PrismaService,
    BankrollHourlySnapshotService,
    BankrollDailySnapshotService,
    BankrollMonthlySnapshotService,
    BankrollWeeklySnapshotService,
    BankrollYearlySnapshotService,
  ],
  controllers: [
    BankrollHourlySnapshotController,
    BankrollDailySnapshotController,
    BankrollMonthlySnapshotController,
    BankrollWeeklySnapshotController,
    BankrollYearlySnapshotController,
  ],
  exports: [
    BankrollHourlySnapshotService,
    BankrollDailySnapshotService,
    BankrollMonthlySnapshotService,
    BankrollWeeklySnapshotService,
    BankrollYearlySnapshotService,
  ],
})
export class BankrollSnapshotsModule {}
