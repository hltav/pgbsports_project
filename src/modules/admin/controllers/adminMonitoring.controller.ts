import { UseGuards, Controller, Get, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../libs';
import { MetricsService } from '../../monitoring/services/metrics.service';
import { PerformanceService } from '../../monitoring/services/performance.service';
import { DatabaseMetricsResponseDto } from './../../../modules/monitoring/schemas/databaseMetrics.schema';
import { CacheService } from './../../../libs/services/cache/cache.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPPORT, Role.SUPER_ADMIN)
@Controller('admin/monitoring')
export class AdminMonitoringController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly performanceService: PerformanceService,
    private readonly cacheService: CacheService,
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

  @Get('cache')
  async getCacheMetrics() {
    const metrics = await this.cacheService.getMetrics();

    const hitRate =
      metrics.keyspaceHits + metrics.keyspaceMisses > 0
        ? (metrics.keyspaceHits /
            (metrics.keyspaceHits + metrics.keyspaceMisses)) *
          100
        : 0;

    return {
      status: 'connected',
      ...metrics,
      hitRate: Number(hitRate.toFixed(2)),
      timestamp: new Date().toISOString(),
    };
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
