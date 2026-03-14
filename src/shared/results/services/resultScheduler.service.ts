import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BetSettlementOrchestratorService } from './betSettlementOrchestrator.service';
import { MatchService } from '../../../modules/matchs/match.service';

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

  async triggerManualUpdateDirect(): Promise<{
    message: string;
    timestamp: Date;
  }> {
    if (this.isRunning) {
      this.logger.warn('Update already in progress...');
      return { message: 'Update already running', timestamp: new Date() };
    }

    this.isRunning = true;
    try {
      this.logger.log('Scheduled update started');
      await this.resultUpdater.updateAllPendingBetsDirect();
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
      // 1️⃣ Busca os IDs das partidas que precisam ser sincronizadas
      const events = await this.matchApiService.findMatchesNeedingSync();

      if (!events.length) {
        this.logger.log('📭 No fixtures needing sync');
        return;
      }

      const ids = events
        .map((e) => e.apiSportsEventId)
        .filter((id): id is string => !!id); // garante que não há nulls/undefined

      // 2️⃣ Enfileira tudo de uma vez — o worker processa em paralelo com rate limit
      const { queued, jobIds } =
        await this.matchApiService.enqueueBatchSync(ids);

      this.logger.log(
        `📬 Enqueued ${queued}/${events.length} fixtures | jobIds: [${jobIds.join(', ')}]`,
      );

      // ℹ️ Não há mais loop aqui — o worker (SyncFixtureProcessor) cuida de:
      //    - Chamar syncFixtureById para cada job
      //    - Atualizar status para FINISHED quando aplicável
      //    - Retry automático em caso de falha (3x exponential backoff)
    } catch (error) {
      this.logger.error('❌ Erro ao enfileirar eventos da API-Sports:', error);
    }
  }

  async triggerApiSportsUpdateSync(): Promise<void> {
    try {
      const events = await this.matchApiService.findMatchesNeedingSync();

      if (!events.length) {
        this.logger.log('📭 No fixtures needing sync');
        return;
      }

      const ids = events
        .map((e) => e.apiSportsEventId)
        .filter((id): id is string => !!id);

      this.logger.log(`⚡ Syncing ${ids.length} fixtures directly`);

      let finished = 0;

      for (const id of ids) {
        const isFinished = await this.matchApiService.syncFixtureById(id);

        if (isFinished) finished++;
      }

      this.logger.log(
        `✅ Sync completed | processed=${ids.length} finished=${finished}`,
      );
    } catch (error) {
      this.logger.error('❌ Error syncing fixtures directly:', error);
    }
  }
}
