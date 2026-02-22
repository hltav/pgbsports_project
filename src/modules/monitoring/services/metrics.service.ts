import { Injectable } from '@nestjs/common';
import * as os from 'os';
import { PrismaService } from './../../../libs/database/prisma';
import { DatabaseMetricsResponseDto } from '../schemas/databaseMetrics.schema';

interface RequestMetric {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
}

interface ErrorMetric {
  message: string;
  stack?: string;
  path: string;
  timestamp: Date;
}

@Injectable()
export class MetricsService {
  private requestMetrics: RequestMetric[] = [];
  private errorMetrics: ErrorMetric[] = [];
  private readonly MAX_STORED_METRICS = 1000;

  constructor(private prisma: PrismaService) {}

  recordRequest(metric: RequestMetric) {
    this.requestMetrics.push(metric);
    if (this.requestMetrics.length > this.MAX_STORED_METRICS) {
      this.requestMetrics.shift();
    }
  }

  recordError(metric: ErrorMetric) {
    this.errorMetrics.push(metric);
    if (this.errorMetrics.length > this.MAX_STORED_METRICS) {
      this.errorMetrics.shift();
    }
  }

  getMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptime: process.uptime(),
        hostname: os.hostname(),
      },
      memory: {
        heapUsed: this.formatBytes(memUsage.heapUsed),
        heapTotal: this.formatBytes(memUsage.heapTotal),
        rss: this.formatBytes(memUsage.rss),
        external: this.formatBytes(memUsage.external),
        systemFree: this.formatBytes(os.freemem()),
        systemTotal: this.formatBytes(os.totalmem()),
        percentUsed:
          (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2) +
          '%',
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        cores: os.cpus().length,
        loadAverage: os.loadavg(),
      },
      requests: {
        total: this.requestMetrics.length,
        last15min: this.getRecentRequestCount(15),
        last1hour: this.getRecentRequestCount(60),
      },
      errors: {
        total: this.errorMetrics.length,
        last15min: this.getRecentErrorCount(15),
        last1hour: this.getRecentErrorCount(60),
      },
    };
  }

  // async getDatabaseMetrics() {
  //   try {
  //     const startTime = Date.now();

  //     // Test database connection
  //     await this.prisma.$queryRaw`SELECT 1`;

  //     const responseTime = Date.now() - startTime;

  //     // Get database size (PostgreSQL specific)
  //     const dbSize = await this.prisma.$queryRaw<Array<{ size: bigint }>>`
  //       SELECT pg_database_size(current_database()) as size
  //     `;

  //     // Get connection count
  //     const connections = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
  //       SELECT count(*) as count FROM pg_stat_activity WHERE datname = current_database()
  //     `;

  //     return {
  //       status: 'connected',
  //       responseTime: `${responseTime}ms`,
  //       size: this.formatBytes(Number(dbSize[0]?.size || 0)),
  //       activeConnections: Number(connections[0]?.count || 0),
  //     };
  //   } catch {
  //     return {
  //       status: 'error',
  //     };
  //   }
  // }
  async getDatabaseMetrics(): Promise<DatabaseMetricsResponseDto> {
    try {
      const startTime = Date.now();

      await this.prisma.$queryRaw`SELECT 1`;

      const latencyMs = Date.now() - startTime;

      const dbSize = await this.prisma.$queryRaw<Array<{ size: bigint }>>`
      SELECT pg_database_size(current_database()) as size
    `;

      const connections = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) as count
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;

      return {
        status: 'connected',
        latencyMs,
        sizeBytes: Number(dbSize[0]?.size || 0),
        activeConnections: Number(connections[0]?.count || 0),
        timestamp: new Date(),
      };
    } catch {
      return {
        status: 'error',
        timestamp: new Date(),
      };
    }
  }

  getRequestMetrics(limit: number = 100) {
    const recentMetrics = this.requestMetrics.slice(-limit);

    const statusCodeDistribution = recentMetrics.reduce(
      (acc, metric) => {
        const statusGroup = Math.floor(metric.statusCode / 100) * 100;
        acc[statusGroup] = (acc[statusGroup] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    const avgDuration =
      recentMetrics.reduce((sum, m) => sum + m.duration, 0) /
        recentMetrics.length || 0;

    const slowestRequests = [...recentMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map((r) => ({
        method: r.method,
        path: r.path,
        duration: `${r.duration}ms`,
        timestamp: r.timestamp,
      }));

    return {
      total: recentMetrics.length,
      avgDuration: `${avgDuration.toFixed(2)}ms`,
      statusCodeDistribution,
      slowestRequests,
    };
  }

  getErrorMetrics(hours: number = 24) {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentErrors = this.errorMetrics.filter(
      (e) => e.timestamp >= cutoffTime,
    );

    const errorsByPath = recentErrors.reduce(
      (acc, error) => {
        acc[error.path] = (acc[error.path] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topErrors = Object.entries(errorsByPath)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    return {
      total: recentErrors.length,
      period: `${hours}h`,
      topErrors,
      recentErrors: recentErrors.slice(-20).map((e) => ({
        message: e.message,
        path: e.path,
        timestamp: e.timestamp,
      })),
    };
  }

  private getRecentRequestCount(minutes: number): number {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    return this.requestMetrics.filter((m) => m.timestamp >= cutoffTime).length;
  }

  private getRecentErrorCount(minutes: number): number {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    return this.errorMetrics.filter((e) => e.timestamp >= cutoffTime).length;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
