import { Injectable, Logger } from '@nestjs/common';
import { Result } from '@prisma/client';
import { BetWithExternalMatch } from '../types/betWithExternal.types';
import { PrismaService } from '../../../../../libs/database';
import {
  createStats,
  SettlementStats,
} from './../../../../../shared/results/interfaces/betSettleOrch.interface';
import { EventBatchProcessorService } from './eventBatchProcessor.service';

@Injectable()
export class UpdateAllPendingBetsService {
  private readonly logger = new Logger(UpdateAllPendingBetsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly processBatch: EventBatchProcessorService,
  ) {}

  async updateAllPendingBets(): Promise<SettlementStats> {
    const stats = createStats();

    const pendingBets: BetWithExternalMatch[] = await this.prisma.bets.findMany(
      {
        where: {
          result: Result.pending,
          NOT: {
            market: { contains: 'Resultado Antecipado', mode: 'insensitive' },
          },
        },
        include: { externalMatch: true },
      },
    );

    if (!pendingBets.length) {
      this.logger.log('No pending bets to process');
      return stats;
    }

    // Agrupa por tsdbEventId (prioridade) ou apiSportsEventId (fallback)
    const betsByEvent = new Map<string, BetWithExternalMatch[]>();

    for (const bet of pendingBets) {
      const eventKey =
        bet.tsdbEventId ||
        bet.externalMatch?.apiSportsEventId ||
        bet.apiSportsEventId ||
        bet.externalMatch?.tsdbEventId;

      if (!eventKey) {
        this.logger.debug(`Bet ${bet.id} has no event identifiers, skipping`);
        stats.skipped++;
        continue;
      }

      const normalizedKey = String(eventKey);

      if (!betsByEvent.has(normalizedKey)) {
        betsByEvent.set(normalizedKey, []);
      }
      betsByEvent.get(normalizedKey)!.push(bet);
    }

    this.logger.log(
      `📊 Batch started: ${betsByEvent.size} events | ${pendingBets.length} bets`,
    );

    for (const [eventKey, bets] of betsByEvent) {
      const batchStats = await this.processBatch.processEventBatch(
        eventKey,
        bets,
      );
      stats.processed += batchStats.processed;
      stats.won += batchStats.won;
      stats.lost += batchStats.lost;
      stats.returned += batchStats.returned;
      stats.void += batchStats.void;
      stats.errors += batchStats.errors;
      stats.skipped += batchStats.skipped;
    }

    this.logger.log(
      `✅ Batch completed: ${stats.processed} processed | ` +
        `${stats.won} won | ${stats.lost} lost | ` +
        `${stats.returned} returned | ${stats.void} void | ` +
        `${stats.skipped} skipped | ${stats.errors} errors`,
    );

    return stats;
  }
}
