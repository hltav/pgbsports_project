import { UseGuards, Controller, Get, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../libs';
import { MetricsService } from '../../monitoring/services/metrics.service';
import { PerformanceService } from '../../monitoring/services/performance.service';
import { DatabaseMetricsResponseDto } from './../../../modules/monitoring/schemas/databaseMetrics.schema';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPPORT, Role.SUPER_ADMIN)
@Controller('admin/monitoring')
export class AdminMonitoringController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly performanceService: PerformanceService,
  ) {}

  @Get('metrics')
  getMetrics() {
    return this.metricsService.getDatabaseMetrics();
  }

  @Get('performance')
  getPerformance(@Query('period') period?: string) {
    return this.performanceService.getPerformanceReport(period);
  }

  @Get('database')
  getDatabaseMetrics(): Promise<DatabaseMetricsResponseDto> {
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
