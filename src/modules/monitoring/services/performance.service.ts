import { Injectable } from '@nestjs/common';
import { PrismaService } from './../../../libs/database/prisma/prisma.service';

interface PerformanceSnapshot {
  timestamp: Date;
  memoryUsage: number;
  cpuUsage: number;
  activeRequests: number;
}

@Injectable()
export class PerformanceService {
  private snapshots: PerformanceSnapshot[] = [];
  private readonly MAX_SNAPSHOTS = 1440; // 24h with 1min interval
  private snapshotInterval: NodeJS.Timeout;

  constructor(private prisma: PrismaService) {
    this.startPerformanceMonitoring();
  }

  private startPerformanceMonitoring() {
    // Take snapshot every minute
    this.snapshotInterval = setInterval(() => {
      this.takeSnapshot();
    }, 60000);
  }

  private lastCpuUsage = process.cpuUsage();
  private lastCpuTime = Date.now();

  private takeSnapshot() {
    const memUsage = process.memoryUsage();

    const now = Date.now();
    const elapsedMs = now - this.lastCpuTime;
    const currentCpu = process.cpuUsage(this.lastCpuUsage); // delta automatico

    // (user + system) em microsegundos / (tempo decorrido em microsegundos) * 100
    const cpuPercent =
      ((currentCpu.user + currentCpu.system) / (elapsedMs * 1000)) * 100;

    this.lastCpuUsage = process.cpuUsage();
    this.lastCpuTime = now;

    const snapshot: PerformanceSnapshot = {
      timestamp: new Date(),
      memoryUsage: memUsage.heapUsed,
      cpuUsage: parseFloat(cpuPercent.toFixed(2)),
      activeRequests: 0,
    };

    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.MAX_SNAPSHOTS) {
      this.snapshots.shift();
    }
  }

  getPerformanceReport(period?: string) {
    let minutes: number;

    switch (period) {
      case '15m':
        minutes = 15;
        break;
      case '1h':
        minutes = 60;
        break;
      case '6h':
        minutes = 360;
        break;
      case '24h':
        minutes = 1440;
        break;
      default:
        minutes = 60;
    }

    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    const relevantSnapshots = this.snapshots.filter(
      (s) => s.timestamp >= cutoffTime,
    );

    if (relevantSnapshots.length === 0) {
      return {
        period,
        message: 'No data available for this period',
      };
    }

    const avgMemory =
      relevantSnapshots.reduce((sum, s) => sum + s.memoryUsage, 0) /
      relevantSnapshots.length;
    const maxMemory = Math.max(...relevantSnapshots.map((s) => s.memoryUsage));
    const minMemory = Math.min(...relevantSnapshots.map((s) => s.memoryUsage));

    const avgCpu =
      relevantSnapshots.reduce((sum, s) => sum + s.cpuUsage, 0) /
      relevantSnapshots.length;

    return {
      period,
      dataPoints: relevantSnapshots.length,
      memory: {
        avg: this.formatBytes(avgMemory),
        max: this.formatBytes(maxMemory),
        min: this.formatBytes(minMemory),
      },
      cpu: {
        avg: avgCpu.toFixed(2),
      },
      trend: this.calculateTrend(relevantSnapshots),
    };
  }

  private calculateTrend(snapshots: PerformanceSnapshot[]) {
    if (snapshots.length < 2) return 'stable';

    const firstHalf = snapshots.slice(0, Math.floor(snapshots.length / 2));
    const secondHalf = snapshots.slice(Math.floor(snapshots.length / 2));

    const avgFirst =
      firstHalf.reduce((sum, s) => sum + s.memoryUsage, 0) / firstHalf.length;
    const avgSecond =
      secondHalf.reduce((sum, s) => sum + s.memoryUsage, 0) / secondHalf.length;

    const diff = ((avgSecond - avgFirst) / avgFirst) * 100;

    if (diff > 10) return 'increasing';
    if (diff < -10) return 'decreasing';
    return 'stable';
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  onModuleDestroy() {
    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
    }
  }
}
