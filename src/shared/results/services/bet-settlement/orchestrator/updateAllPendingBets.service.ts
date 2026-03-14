// import { Injectable, Logger } from '@nestjs/common';
// import { Result, Prisma } from '@prisma/client'; // Importar Prisma para capturar erros
// import { BetWithExternalMatch } from '../types/betWithExternal.types';
// import { PrismaService } from '../../../../../libs/database';
// import {
//   createStats,
//   SettlementStats,
// } from './../../../../../shared/results/interfaces/betSettleOrch.interface';
// import { EventBatchProcessorService } from './eventBatchProcessor.service';

// @Injectable()
// export class UpdateAllPendingBetsService {
//   private readonly logger = new Logger(UpdateAllPendingBetsService.name);

//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly processBatch: EventBatchProcessorService,
//   ) {}

//   async updateAllPendingBets(): Promise<SettlementStats> {
//     const stats = createStats();
//     let pendingBets: BetWithExternalMatch[] = [];

//     // --- BLOCO COM RETRY PARA CONEXÃO DA RAILWAY ---
//     try {
//       pendingBets = await this.fetchPendingBets();
//     } catch (error) {
//       if (this.isConnectionError(error)) {
//         this.logger.warn(
//           '⚠️ Conexão perdida com a Railway. Tentando reconectar em 1s...',
//         );
//         await new Promise((res) => setTimeout(res, 1000));
//         pendingBets = await this.fetchPendingBets(); // Segunda tentativa
//       } else {
//         throw error; // Se for outro erro, interrompe
//       }
//     }
//     // ----------------------------------------------

//     if (!pendingBets.length) {
//       this.logger.log('No pending bets to process');
//       return stats;
//     }

//     const betsByEvent = new Map<string, BetWithExternalMatch[]>();

//     for (const bet of pendingBets) {
//       const eventKey =
//         bet.tsdbEventId ||
//         bet.externalMatch?.apiSportsEventId ||
//         bet.apiSportsEventId ||
//         bet.externalMatch?.tsdbEventId;

//       if (!eventKey) {
//         this.logger.debug(`Bet ${bet.id} has no event identifiers, skipping`);
//         stats.skipped++;
//         continue;
//       }

//       const normalizedKey = String(eventKey);
//       if (!betsByEvent.has(normalizedKey)) betsByEvent.set(normalizedKey, []);
//       betsByEvent.get(normalizedKey)!.push(bet);
//     }

//     this.logger.log(
//       `📊 Batch started: ${betsByEvent.size} events | ${pendingBets.length} bets`,
//     );

//     for (const [eventKey, bets] of betsByEvent) {
//       try {
//         const batchStats = await this.processBatch.processEventBatch(
//           eventKey,
//           bets,
//         );
//         stats.processed += batchStats.processed;
//         stats.won += batchStats.won;
//         stats.lost += batchStats.lost;
//         stats.returned += batchStats.returned;
//         stats.void += batchStats.void;
//         stats.errors += batchStats.errors;
//         stats.skipped += batchStats.skipped;
//       } catch (error) {
//         this.logger.error(
//           `❌ Erro crítico ao processar evento ${eventKey}:`,
//           error,
//         );
//         stats.errors += bets.length;
//       }
//     }

//     this.logger.log(
//       `✅ Batch completed: ${stats.processed} processed | ` +
//         `${stats.won} won | ${stats.lost} lost | ` +
//         `${stats.returned} returned | ${stats.void} void | ` +
//         `${stats.skipped} skipped | ${stats.errors} errors`,
//     );

//     return stats;
//   }

//   // Método auxiliar para facilitar o retry
//   private async fetchPendingBets(): Promise<BetWithExternalMatch[]> {
//     return this.prisma.bets.findMany({
//       where: {
//         result: Result.pending,
//         NOT: {
//           market: { contains: 'Resultado Antecipado', mode: 'insensitive' },
//         },
//       },
//       include: { externalMatch: true },
//     }) as unknown as Promise<BetWithExternalMatch[]>;
//   }

//   // Identifica se o erro é de fechamento de conexão (P1017)
//   private isConnectionError(error: any): boolean {
//     return (
//       error instanceof Prisma.PrismaClientKnownRequestError &&
//       error.code === 'P1017'
//     );
//   }
// }
import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Result, Prisma } from '@prisma/client';
import { BetWithExternalMatch } from '../types/betWithExternal.types';
import { PrismaService } from '../../../../../libs/database';
import {
  createStats,
  SettlementStats,
} from '../../../../../shared/results/interfaces/betSettleOrch.interface';
import { QueueService } from '../../../../../libs/services/queue/queue.service';
import { EventBatchProcessorService } from './eventBatchProcessor.service';

@Injectable()
export class UpdateAllPendingBetsService {
  private readonly logger = new Logger(UpdateAllPendingBetsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => QueueService))
    private readonly queueService: QueueService,
    private readonly processBatch: EventBatchProcessorService,
  ) {}

  async updateAllPendingBets(): Promise<SettlementStats> {
    const stats = createStats();

    let pendingBets: BetWithExternalMatch[] = [];

    try {
      pendingBets = await this.fetchPendingBets();
    } catch (error) {
      if (this.isConnectionError(error)) {
        this.logger.warn('⚠️ Conexão perdida. Tentando reconectar em 1s...');
        await new Promise((res) => setTimeout(res, 1000));
        pendingBets = await this.fetchPendingBets();
      } else {
        throw error;
      }
    }

    if (!pendingBets.length) {
      this.logger.log('No pending bets to process');
      return stats;
    }

    // Agrupa betIds por eventKey (mesma lógica de antes, mas só guarda IDs)
    const eventMap = new Map<string, number[]>();

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

      const key = String(eventKey);
      if (!eventMap.has(key)) eventMap.set(key, []);
      eventMap.get(key)!.push(bet.id);
    }

    this.logger.log(
      `📊 Enqueueing ${eventMap.size} events | ${pendingBets.length} bets`,
    );

    // Enfileira tudo — o worker processa em paralelo controlado
    const { queued } = await this.queueService.enqueueSettleBatch(eventMap);

    this.logger.log(`📬 ${queued} settle-event jobs enqueued`);

    // Retorna stats parciais — o resultado real vem do worker
    stats.processed = queued;
    return stats;
  }

  async updateAllPendingBetsDirect(): Promise<SettlementStats> {
    const stats = createStats();
    let pendingBets: BetWithExternalMatch[] = [];

    // --- BLOCO COM RETRY PARA CONEXÃO DA RAILWAY ---
    try {
      pendingBets = await this.fetchPendingBets();
    } catch (error) {
      if (this.isConnectionError(error)) {
        this.logger.warn(
          '⚠️ Conexão perdida com a Railway. Tentando reconectar em 1s...',
        );
        await new Promise((res) => setTimeout(res, 1000));
        pendingBets = await this.fetchPendingBets(); // Segunda tentativa
      } else {
        throw error; // Se for outro erro, interrompe
      }
    }
    // ----------------------------------------------

    if (!pendingBets.length) {
      this.logger.log('No pending bets to process');
      return stats;
    }

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
      if (!betsByEvent.has(normalizedKey)) betsByEvent.set(normalizedKey, []);
      betsByEvent.get(normalizedKey)!.push(bet);
    }

    this.logger.log(
      `📊 Batch started: ${betsByEvent.size} events | ${pendingBets.length} bets`,
    );

    for (const [eventKey, bets] of betsByEvent) {
      try {
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
      } catch (error) {
        this.logger.error(
          `❌ Erro crítico ao processar evento ${eventKey}:`,
          error,
        );
        stats.errors += bets.length;
      }
    }

    this.logger.log(
      `✅ Batch completed: ${stats.processed} processed | ` +
        `${stats.won} won | ${stats.lost} lost | ` +
        `${stats.returned} returned | ${stats.void} void | ` +
        `${stats.skipped} skipped | ${stats.errors} errors`,
    );

    return stats;
  }

  // ─── Método chamado pelo worker para processar um evento específico ──────────
  // EventBatchProcessorService.processEventBatchByIds precisa ser implementado
  // para buscar as bets pelos IDs e processar (ver nota abaixo)

  private async fetchPendingBets(): Promise<BetWithExternalMatch[]> {
    return this.prisma.bets.findMany({
      where: {
        result: Result.pending,
        NOT: {
          market: { contains: 'Resultado Antecipado', mode: 'insensitive' },
        },
      },
      include: { externalMatch: true },
    }) as unknown as Promise<BetWithExternalMatch[]>;
  }

  private isConnectionError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P1017'
    );
  }
}
