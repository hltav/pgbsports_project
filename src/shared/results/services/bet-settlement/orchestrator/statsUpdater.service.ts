import { Injectable, Logger } from '@nestjs/common';
import { BetWithExternalMatch } from '../types/betWithExternal.types';
import { Result } from '@prisma/client';
import { SettlementStats } from './../../../../../shared/results/interfaces/betSettleOrch.interface';

@Injectable()
export class StatsUpdateService {
  private readonly logger = new Logger(StatsUpdateService.name);

  constructor() {}

  updateStats(
    results: PromiseSettledResult<Result | null>[],
    stats: SettlementStats,
    bets: BetWithExternalMatch[],
  ): SettlementStats {
    results.forEach((result, i) => {
      if (result.status === 'fulfilled' && result.value) {
        stats.processed++;
        const val = result.value;

        if (val === Result.win) {
          stats.won++;
        } else if (val === Result.lose) {
          stats.lost++;
        } else if (val === Result.returned) {
          stats.returned++;
        } else if (val === Result.void) {
          stats.void++;
        }
      } else if (result.status === 'rejected') {
        stats.errors++;
        this.logger.error(`Error settling bet ${bets[i].id}: ${result.reason}`);
      }
    });
    return stats;
  }
}
