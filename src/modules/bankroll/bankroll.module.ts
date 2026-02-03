import { Module } from '@nestjs/common';
import { BankrollService } from './bankroll.service';
import { PrismaModule, PrismaService } from './../../libs/database/prisma';
import { BankrollController } from './bankroll.controller';
import { BankrollSnapshotsModule } from './snapshots/bankrollSnapshots.module';
import { BankrollStreakModule } from './streak/bankrollStreak.module';
import { CreateBankrollService } from './core/services/create-bankroll.service';
import { DeleteBankrollService } from './core/services/delete-bankroll.service';
import { FindBankrollService } from './core/services/find-bankroll.service';
import { FindBankrollHistoryService } from './core/services/findBankrollHistory.service';
import { UpdateBankrollService } from './core/services/update-bankroll.service';
import { RouterModule } from '@nestjs/core';
import { BankrollAlertsModule } from './alerts/bankrollAlerts.module';
import { BankrollCoreModule } from './core/bankrollCore.module';
import { BankrollOperationsModule } from './operation/bankrollOperation.module';
import { BankrollRecordsModule } from './records/bankrollRecords.module';
import { BankrollStatsModule } from './analytics_dashboard/bankrollStats.module';
import { BankrollGoalsModule } from './goal/bankrollGoal.module';
import { BankrollQueryFiltersModule } from './query_filters/bankrollQueryFilters.module';
import { BankrollPaginationModule } from './pagination/bankrollPagination.module';
import { JobsBankrollModule } from './jobs/jobsBankroll.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'bankrolls',
        children: [
          {
            path: ':bankrollId',
            children: [
              { path: '', module: BankrollCoreModule },
              { path: 'snapshots', module: BankrollSnapshotsModule },
              { path: 'operations', module: BankrollOperationsModule },
              { path: 'stats', module: BankrollStatsModule },
              { path: 'goals', module: BankrollGoalsModule },
              { path: 'alerts', module: BankrollAlertsModule },
              { path: 'records', module: BankrollRecordsModule },
              { path: 'filters', module: BankrollQueryFiltersModule },
              { path: 'streaks', module: BankrollStreakModule },
            ],
          },
        ],
      },
    ]),

    // Remova BankrollCoreModule daqui se já está no RouterModule
    BankrollSnapshotsModule,
    BankrollOperationsModule,
    BankrollStatsModule,
    BankrollAlertsModule,
    BankrollGoalsModule,
    BankrollRecordsModule,
    BankrollQueryFiltersModule,
    BankrollStreakModule,
    PrismaModule,
    BankrollPaginationModule,
    JobsBankrollModule,
  ],

  providers: [
    PrismaService,
    BankrollService,
    FindBankrollService,
    CreateBankrollService,
    UpdateBankrollService,
    DeleteBankrollService,
    FindBankrollHistoryService,
  ],
  controllers: [BankrollController],
  exports: [
    BankrollService,
    FindBankrollService,
    CreateBankrollService,
    UpdateBankrollService,
    DeleteBankrollService,
    FindBankrollHistoryService,
  ],
})
export class BankrollModule {}
