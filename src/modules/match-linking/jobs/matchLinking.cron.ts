import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MatchLinkingService } from '../services/matchLinking.service';

@Injectable()
export class MatchLinkingCron {
  private readonly logger = new Logger(MatchLinkingCron.name);

  constructor(private readonly matchLinkingService: MatchLinkingService) {}

  /**
   * Executa a cada 5 minutos
   * Processa apostas recentes sem ExternalMatch
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async processRecentBets() {
    this.logger.log('⏰ Iniciando CRON de linking de apostas');

    try {
      await this.matchLinkingService.processPendingBets(50);
      this.logger.log('✅ CRON concluído com sucesso');
    } catch (error) {
      this.logger.error(`❌ Erro no CRON: ${error}`, error);
    }
  }

  /**
   * Executa diariamente às 3h da manhã
   * Processa todas as apostas pendentes (cleanup)
   */
  @Cron('0 3 * * *')
  async dailyCleanup() {
    this.logger.log('🧹 Iniciando cleanup diário de apostas pendentes');

    try {
      await this.matchLinkingService.processPendingBets(500);
      this.logger.log('✅ Cleanup diário concluído');
    } catch (error) {
      this.logger.error(`❌ Erro no cleanup: ${error}`, error);
    }
  }
}
