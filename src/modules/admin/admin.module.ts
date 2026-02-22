import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminFinanceController } from './controllers/adminFinance.controller';
import { AdminJobsController } from './controllers/adminJobs.controller';
import { AdminMonitoringController } from './controllers/adminMonitoring.controller';
import { AdminUsersController } from './controllers/adminUsers.controller';
import { AdminFinanceService } from './services/adminFinance.service';
import { AdminJobRunnerService } from './services/adminJobs.service';
import { AdminUsersService } from './services/adminUsers.service';
import { BankrollModule } from '../bankroll/bankroll.module';
import { MyCacheModule } from './../../libs/services/cache/cache.module';
import { UsersModule } from '../users/users.module';
import { MonitoringModule } from '../monitoring/monitoring.module';
import { HealthModule } from '../health/health.module';
// import { JobsBankrollModule } from '../bankroll/jobs/jobsBankroll.module';

@Module({
  imports: [
    BankrollModule,
    UsersModule,
    MyCacheModule,
    MonitoringModule,
    HealthModule,
  ],
  providers: [
    AdminService,
    AdminFinanceService,
    AdminJobRunnerService,
    AdminUsersService,
  ],
  controllers: [
    AdminController,
    AdminFinanceController,
    AdminJobsController,
    AdminMonitoringController,
    AdminUsersController,
  ],
  exports: [
    AdminService,
    AdminFinanceService,
    AdminJobRunnerService,
    AdminUsersService,
  ],
})
export class AdminModule {}
