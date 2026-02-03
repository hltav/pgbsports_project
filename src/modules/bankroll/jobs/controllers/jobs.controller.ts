import { Controller, Post } from '@nestjs/common';
import { BankrollMonthlySnapshotJob } from '../bankrollMonthlySnapshot.job';
import { BankrollWeeklySnapshotJob } from '../bankrollWeeklySnapshot.job';
import { BankrollYearlySnapshotJob } from '../bankrollYearlySnapshot.job';
import { BankrollDailySnapshotJob } from '../bankrollDailySnapshot.job';
import { BankrollHourlySnapshotJob } from '../bankrollHourlySnapshot.job';

@Controller('bankroll/jobs')
export class SnapshotJobController {
  constructor(
    private readonly hourlySnapshotJob: BankrollHourlySnapshotJob,
    private readonly dailySnapshotJob: BankrollDailySnapshotJob,
    private readonly monthlySnapshotJob: BankrollMonthlySnapshotJob,
    private readonly weeklySnapshotJob: BankrollWeeklySnapshotJob,
    private readonly yearlySnapshotJob: BankrollYearlySnapshotJob,
  ) {}

  // ==================== EXECUÇÃO MANUAL ====================

  @Post('run-hourly-snapshot')
  async runHourlySnapshot() {
    await this.hourlySnapshotJob.handleHourlySnapshot();
    return { message: 'Snapshot horário executado com sucesso' };
  }

  @Post('run-daily-snapshot')
  async runDailySnapshot() {
    await this.dailySnapshotJob.handleDailySnapshot();
    return { message: 'Snapshot diário executado com sucesso' };
  }

  @Post('run-weekly-snapshot')
  async runWeeklySnapshot() {
    await this.weeklySnapshotJob.handleWeeklySnapshot();
    return { message: 'Snapshot semanal executado com sucesso' };
  }

  @Post('run-monthly-snapshot')
  async runMonthlySnapshot() {
    await this.monthlySnapshotJob.handleMonthlySnapshot();
    return { message: 'Snapshot mensal executado com sucesso' };
  }

  @Post('run-yearly-snapshot')
  async runYearlySnapshot() {
    await this.yearlySnapshotJob.handleYearlySnapshot();
    return { message: 'Snapshot anual executado com sucesso' };
  }
}
