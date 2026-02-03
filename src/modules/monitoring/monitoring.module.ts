import { Module } from '@nestjs/common';
import { MonitoringController } from './controllers/monitoring.controller';
import { MetricsService } from './services/metrics.service';
import { PrismaModule } from './../../libs/database/prisma/prisma.module';
import { LoggingService } from './services/logging.service';
import { PerformanceService } from './services/performance.service';

@Module({
  imports: [PrismaModule],
  controllers: [MonitoringController],
  providers: [MetricsService, PerformanceService, LoggingService],
  exports: [MetricsService, PerformanceService, LoggingService],
})
export class MonitoringModule {}
