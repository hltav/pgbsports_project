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
import { QueueModule } from './../../libs/services/queue/queue.module';
import { AdminQueueController } from './controllers/adminQueue.controller';
import { AdminQueueService } from './services/adminQueue.service';

@Module({
  imports: [
    BankrollModule,
    UsersModule,
    MyCacheModule,
    MonitoringModule,
    HealthModule,
    QueueModule,
  ],
  providers: [
    AdminService,
    AdminFinanceService,
    AdminJobRunnerService,
    AdminUsersService,
    AdminQueueService,
  ],
  controllers: [
    AdminController,
    AdminFinanceController,
    AdminJobsController,
    AdminMonitoringController,
    AdminUsersController,
    AdminQueueController,
  ],
  exports: [
    AdminService,
    AdminFinanceService,
    AdminJobRunnerService,
    AdminUsersService,
    AdminQueueService,
  ],
})
export class AdminModule {}
