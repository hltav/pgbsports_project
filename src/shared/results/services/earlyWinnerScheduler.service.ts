import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BetSettlementOrchestratorService } from './betSettlementOrchestrator.service';

@Injectable()
export class EarlyWinnerSchedulerService {
  private readonly logger = new Logger(EarlyWinnerSchedulerService.name);
  private isRunning = false;

  constructor(
    private readonly betSettlementOrchestrator: BetSettlementOrchestratorService,
  ) {
    this.logger.log('✅ EarlyWinnerSchedulerService instantiated');
  }

  // 🔁 Cron rápido, só para early winner
  //Cron roda a cada 2 minutos.
  @Cron('20 */2 * * * *')
  async handleEarlyWinner(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('EarlyWinnerScheduler already running...');
      return;
    }

    this.isRunning = true;
    try {
      this.logger.debug('🏃 EarlyWinnerScheduler started');
      this.logger.log('🏃 EarlyWinnerScheduler tick');
      const count =
        await this.betSettlementOrchestrator.updateEarlyWinnerBets();
      this.logger.log(`🏁 EarlyWinnerScheduler done (processed=${count})`);
    } catch (error) {
      this.logger.error('Erro no EarlyWinnerScheduler', error);
    } finally {
      this.isRunning = false;
    }
  }
}
