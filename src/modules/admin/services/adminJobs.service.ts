import { Injectable, BadRequestException } from '@nestjs/common';
import { CacheService } from '../../../libs/services/cache/cache.service';
import { BankrollHourlySnapshotJob } from '../../bankroll/jobs/bankrollHourlySnapshot.job';
import { BankrollDailySnapshotJob } from '../../bankroll/jobs/bankrollDailySnapshot.job';
import { BankrollWeeklySnapshotJob } from '../../bankroll/jobs/bankrollWeeklySnapshot.job';
import { BankrollMonthlySnapshotJob } from '../../bankroll/jobs/bankrollMonthlySnapshot.job';
import { BankrollYearlySnapshotJob } from '../../bankroll/jobs/bankrollYearlySnapshot.job';

@Injectable()
export class AdminJobRunnerService {
  private readonly LOCK_TTL_SECONDS = 600; // 10 minutos

  constructor(
    private readonly cacheService: CacheService,
    private readonly hourly: BankrollHourlySnapshotJob,
    private readonly daily: BankrollDailySnapshotJob,
    private readonly weekly: BankrollWeeklySnapshotJob,
    private readonly monthly: BankrollMonthlySnapshotJob,
    private readonly yearly: BankrollYearlySnapshotJob,
  ) {}

  async runSnapshot(type: string) {
    const lockKey = `lock:snapshot:${type}`;

    // 🔒 Tentativa de adquirir lock
    const acquired = await this.cacheService.setIfNotExists(
      lockKey,
      'locked',
      this.LOCK_TTL_SECONDS,
    );

    if (!acquired) {
      throw new BadRequestException(`Snapshot ${type} já está em execução`);
    }

    try {
      switch (type) {
        case 'hourly':
          return await this.hourly.handleHourlySnapshot();

        case 'daily':
          return await this.daily.handleDailySnapshot();

        case 'weekly':
          return await this.weekly.handleWeeklySnapshot();

        case 'monthly':
          return await this.monthly.handleMonthlySnapshot();

        case 'yearly':
          return await this.yearly.handleYearlySnapshot();

        default:
          throw new BadRequestException('Tipo inválido');
      }
    } finally {
      // 🔓 Libera lock manualmente
      await this.cacheService.del(lockKey);
    }
  }
}
