import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BetSettlementOrchestratorService } from './betSettlementOrchestrator.service';
import { MatchService } from './../../../modules/matchs/match.service';

@Injectable()
export class ResultSchedulerService {
  private readonly logger = new Logger(ResultSchedulerService.name);
  private isRunning = false;

  constructor(
    private readonly resultUpdater: BetSettlementOrchestratorService,
    private readonly matchApiService: MatchService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleResultUpdate(): Promise<void> {
    await this.triggerManualUpdate();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleApiSportsUpdate(): Promise<void> {
    await this.triggerApiSportsUpdate();
  }

  // Esta é a função que o Controller vai chamar
  async triggerManualUpdate(): Promise<{ message: string; timestamp: Date }> {
    if (this.isRunning) {
      this.logger.warn('Update already in progress...');
      return { message: 'Update already running', timestamp: new Date() };
    }

    this.isRunning = true;
    try {
      this.logger.log('Scheduled update started');
      await this.resultUpdater.updateAllPendingBets();
      return {
        message: 'Batch update completed successfully',
        timestamp: new Date(),
      };
    } finally {
      this.isRunning = false;
    }
  }

  async triggerApiSportsUpdate(): Promise<void> {
    try {
      // Busca os eventos que precisam ser atualizados
      const events = await this.matchApiService.findMatchesNeedingSync();
      for (const event of events) {
        const isFinished = await this.matchApiService.syncFixtureById(
          event.apiSportsEventId,
        );
        if (isFinished) {
          this.logger.debug(
            `ResultScheduler forcing status=FINISHED for event=${event.apiSportsEventId}`,
          );

          // Se a partida foi finalizada, atualiza o externalMatch e remove do TheSportsDB
          await this.matchApiService.updateScores(event.apiSportsEventId, {
            status: 'FINISHED',
          });
        }
      }
    } catch (error) {
      this.logger.error('Erro ao atualizar eventos da API-Sports:', error);
    }
  }
}
