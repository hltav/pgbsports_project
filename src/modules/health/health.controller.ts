import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from './../../libs/database/prisma/prisma.service';
import { Public } from './../../libs/common/decorator/public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    // Se for Windows em desenvolvimento, não verifica disco
    if (process.platform === 'win32' && process.env.NODE_ENV !== 'production') {
      return this.health.check([
        () => this.prismaHealth.pingCheck('database', this.prismaService),
        () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024),
        () => this.memory.checkRSS('memory_rss', 800 * 1024 * 1024),
      ]);
    }

    // Para produção ou não-Windows
    const diskPath = process.platform === 'win32' ? 'C:\\' : '/';

    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prismaService),
      () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 800 * 1024 * 1024),
      () =>
        this.disk.checkStorage('storage', {
          thresholdPercent: 0.9,
          path: diskPath,
        }),
    ]);
  }

  @Get('liveness')
  @Public()
  getLiveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('readiness')
  @Public()
  @HealthCheck()
  getReadiness() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prismaService),
    ]);
  }
}
