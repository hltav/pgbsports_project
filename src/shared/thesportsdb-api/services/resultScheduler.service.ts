import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ResultUpdaterService } from './resultUpdater.service';

@Injectable()
export class ResultSchedulerService {
  private readonly logger = new Logger(ResultSchedulerService.name);

  constructor(private resultUpdater: ResultUpdaterService) {
    console.log('🟢 ResultSchedulerService instanciado');
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleResultUpdate(): Promise<void> {
    this.logger.log('Starting scheduled result update');

    try {
      await this.resultUpdater.updateAllPendingEvents();
      this.logger.log('Scheduled result update completed');
    } catch (error) {
      this.logger.error(
        'Error during scheduled result update',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async triggerManualUpdate(): Promise<{ message: string; timestamp: Date }> {
    this.logger.log('Manual result update triggered');
    await this.resultUpdater.updateAllPendingEvents();

    return {
      message: 'Result update completed',
      timestamp: new Date(),
    };
  }
}
