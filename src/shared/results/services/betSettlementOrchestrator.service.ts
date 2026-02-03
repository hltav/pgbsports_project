import { Injectable } from '@nestjs/common';
import { SettlementStats } from '../interfaces/betSettleOrch.interface';
import { EarlyWinnerUpdateService } from './bet-settlement/orchestrator/earlyWinnerUpdater.service';
import { UpdateAllPendingBetsService } from './bet-settlement/orchestrator/updateAllPendingBets.service';

@Injectable()
export class BetSettlementOrchestratorService {
  constructor(
    private readonly earlyWinner: EarlyWinnerUpdateService,
    private readonly updatePending: UpdateAllPendingBetsService,
  ) {}

  /**
   * ENTRYPOINT DO BATCH - MELHORADO
   */
  async updateAllPendingBets(): Promise<SettlementStats> {
    return this.updatePending.updateAllPendingBets();
  }

  async updateEarlyWinnerBets(): Promise<number> {
    return this.earlyWinner.updateEarlyWinnerBets();
  }
}
