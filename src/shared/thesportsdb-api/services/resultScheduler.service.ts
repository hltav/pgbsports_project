import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ResultUpdaterService } from './resultUpdater.service';

@Injectable()
export class ResultSchedulerService {
  private readonly logger = new Logger(ResultSchedulerService.name);

  constructor(private resultUpdater: ResultUpdaterService) {}

  // Executa a cada 5 minutos
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

  // Executa a cada 30 minutos (alternativa mais leve)
  // @Cron(CronExpression.EVERY_30_MINUTES)
  // async handleResultUpdateLight(): Promise<void> {
  //   await this.handleResultUpdate();
  // }

  // Executa manualmente via endpoint
  async triggerManualUpdate(): Promise<{ message: string; timestamp: Date }> {
    this.logger.log('Manual result update triggered');
    await this.resultUpdater.updateAllPendingEvents();

    return {
      message: 'Result update completed',
      timestamp: new Date(),
    };
  }
}
