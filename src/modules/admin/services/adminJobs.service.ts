import { Injectable, BadRequestException } from '@nestjs/common';
import { CacheService } from './../../../libs/services/cache/cache.service';
import { BankrollHourlySnapshotJob } from '../../bankroll/jobs/bankrollHourlySnapshot.job';
import { BankrollDailySnapshotJob } from '../../bankroll/jobs/bankrollDailySnapshot.job';
import { BankrollWeeklySnapshotJob } from '../../bankroll/jobs/bankrollWeeklySnapshot.job';
import { BankrollMonthlySnapshotJob } from '../../bankroll/jobs/bankrollMonthlySnapshot.job';
import { BankrollYearlySnapshotJob } from '../../bankroll/jobs/bankrollYearlySnapshot.job';
import { QueueService } from './../../../libs/services/queue/queue.service';

// @Injectable()
// export class AdminJobRunnerService {
//   private readonly LOCK_TTL_SECONDS = 600; // 10 minutos

//   constructor(
//     private readonly cacheService: CacheService,
//     private readonly hourly: BankrollHourlySnapshotJob,
//     private readonly daily: BankrollDailySnapshotJob,
//     private readonly weekly: BankrollWeeklySnapshotJob,
//     private readonly monthly: BankrollMonthlySnapshotJob,
//     private readonly yearly: BankrollYearlySnapshotJob,
//   ) {}

//   async runSnapshot(type: string) {
//     const lockKey = `lock:snapshot:${type}`;

//     // 🔒 Tentativa de adquirir lock
//     const acquired = await this.cacheService.setIfNotExists(
//       lockKey,
//       'locked',
//       this.LOCK_TTL_SECONDS,
//     );

//     if (!acquired) {
//       throw new BadRequestException(`Snapshot ${type} já está em execução`);
//     }

//     try {
//       switch (type) {
//         case 'hourly':
//           return await this.hourly.handleHourlySnapshot();

//         case 'daily':
//           return await this.daily.handleDailySnapshot();

//         case 'weekly':
//           return await this.weekly.handleWeeklySnapshot();

//         case 'monthly':
//           return await this.monthly.handleMonthlySnapshot();

//         case 'yearly':
//           return await this.yearly.handleYearlySnapshot();

//         default:
//           throw new BadRequestException('Tipo inválido');
//       }
//     } finally {
//       // 🔓 Libera lock manualmente
//       await this.cacheService.del(lockKey);
//     }
//   }
// }

type SnapshotMode = 'enqueue' | 'run';

@Injectable()
export class AdminJobRunnerService {
  private readonly LOCK_TTL_SECONDS = 600;

  constructor(
    private readonly cacheService: CacheService,
    private readonly hourly: BankrollHourlySnapshotJob,
    private readonly daily: BankrollDailySnapshotJob,
    private readonly weekly: BankrollWeeklySnapshotJob,
    private readonly monthly: BankrollMonthlySnapshotJob,
    private readonly yearly: BankrollYearlySnapshotJob,
    private readonly queueService: QueueService,
  ) {}

  async runSnapshot(
    type: string,
    opts: {
      mode: SnapshotMode;
      params?: { year?: number; month?: number; week?: number };
      force?: boolean;
    } = { mode: 'enqueue' },
  ) {
    const lockKey = `lock:snapshot:${type}:${opts.mode}`;

    if (opts.force) {
      await this.cacheService.del(lockKey);
    }

    const acquired = await this.cacheService.setIfNotExists(
      lockKey,
      'locked',
      this.LOCK_TTL_SECONDS,
    );

    if (!acquired) {
      throw new BadRequestException(`Snapshot ${type} já está em execução`);
    }

    try {
      if (opts.mode === 'enqueue') return this.enqueue(type, opts.params);
      return this.runNow(type, opts.params);
    } finally {
      await this.cacheService.del(lockKey);
    }
  }

  private async enqueue(
    type: string,
    params?: { year?: number; month?: number; week?: number },
  ) {
    switch (type) {
      case 'weekly': {
        if (params?.year && params?.week) {
          return this.queueService.enqueueWeeklySnapshot(
            params.year,
            params.week,
          );
        }
        return this.weekly.handleWeeklySnapshot();
      }

      case 'monthly': {
        if (params?.year && params?.month) {
          return this.queueService.enqueueMonthlySnapshot(
            params.year,
            params.month,
          );
        }
        return this.monthly.handleMonthlySnapshot();
      }

      case 'yearly': {
        if (params?.year) {
          return this.queueService.enqueueYearlySnapshot(params.year);
        }
        return this.yearly.handleYearlySnapshot();
      }

      case 'daily':
        return this.daily.handleDailySnapshot();

      case 'hourly':
        return this.hourly.handleHourlySnapshot();

      default:
        throw new BadRequestException('Tipo inválido');
    }
  }

  private async runNow(
    type: string,
    params?: { year?: number; month?: number; week?: number },
  ) {
    switch (type) {
      case 'hourly': {
        return this.hourly.runHourlyLookbackNow();
      }

      case 'daily':
        // seu daily já sabe calcular “ontem” sozinho
        return this.daily.processDailySnapshot();

      case 'weekly': {
        let year = params?.year;
        let week = params?.week;

        if (!year || !week) {
          const now = new Date();
          const lastWeek = new Date(now);
          lastWeek.setDate(now.getDate() - 7);

          const iso = this.weekly['getISOWeek']?.(lastWeek);

          year = iso.year;
          week = iso.week;
        }

        return this.weekly.processWeeklySnapshot(year, week);
      }

      case 'monthly': {
        const year = params?.year;
        const month = params?.month;
        if (!year || !month)
          throw new BadRequestException(
            'monthly exige year e month (mode=run)',
          );
        return this.monthly.processMonthlySnapshot(year, month);
      }

      case 'yearly': {
        const year = params?.year;
        if (!year)
          throw new BadRequestException('yearly exige year (mode=run)');
        return this.yearly.processYearlySnapshot(year);
      }

      default:
        throw new BadRequestException('Tipo inválido');
    }
  }
}
