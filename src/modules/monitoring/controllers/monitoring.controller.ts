import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MetricsService } from '../services/metrics.service';
import { Roles } from './../../../libs/common/decorator/roles.decorator';
import { PerformanceService } from '../services/performance.service';
import { JwtAuthGuard, RolesGuard } from './../../../libs';
import { Role } from '@prisma/client';

@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
export class MonitoringController {
  constructor(
    private metricsService: MetricsService,
    private performanceService: PerformanceService,
  ) {}

  @Get('metrics')
  getMetrics() {
    return this.metricsService.getMetrics();
  }

  @Get('performance')
  getPerformance(@Query('period') period?: string) {
    return this.performanceService.getPerformanceReport(period);
  }

  @Get('database')
  getDatabaseMetrics() {
    return this.metricsService.getDatabaseMetrics();
  }

  @Get('requests')
  getRequestMetrics(@Query('limit') limit?: number) {
    return this.metricsService.getRequestMetrics(limit);
  }

  @Get('errors')
  getErrorMetrics(@Query('hours') hours?: number) {
    return this.metricsService.getErrorMetrics(hours);
  }
}
