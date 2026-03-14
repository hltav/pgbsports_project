import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from './../../../libs/database';
import { DateTime } from 'luxon';
import { BankrollHourlySnapshotService } from '../snapshots/services/bankrollHourlySnapshot.service';
import { CreateHourlySnapshotDTO } from '../snapshots/dto/hourlySnapshot.dto';
import { BankrollHistoryDTO } from '../z.dto/history/bankrollHistory.dto';
import { QueueService } from './../../../libs/services/queue/queue.service';
import {
  PreviousHistoryData,
  PreviousSnapshotRow,
} from '../snapshots/types/bankrollHourly.types';

@Injectable()
export class BankrollHourlySnapshotJob {
  private readonly logger = new Logger(BankrollHourlySnapshotJob.name);
  private static readonly BATCH_SIZE = 500;
  private static readonly TIME_ZONE = 'America/Sao_Paulo';
  private static readonly LOOKBACK_HOURS = 2;

  constructor(
    private readonly prisma: PrismaService,
    private readonly snapshotService: BankrollHourlySnapshotService,
    @Inject(forwardRef(() => QueueService))
    private readonly queueService: QueueService,
  ) {}

  @Cron('0 7 * * * *', {
    name: 'hourly-bankroll-snapshot',
    timeZone: BankrollHourlySnapshotJob.TIME_ZONE,
  })
  async handleHourlySnapshot(): Promise<void> {
    const buckets = this.buildBuckets(BankrollHourlySnapshotJob.LOOKBACK_HOURS);
    const { queued } = await this.queueService.enqueueHourlyBuckets(
      buckets.map((b) => ({
        bucketStart: b.bucketStart.toISOString(),
        start: b.start.toISOString(),
        end: b.end.toISOString(),
      })),
    );
    this.logger.log(`📬 ${queued} hourly-snapshot jobs enqueued`);
  }

  async runHourlyLookbackNow(
    lookbackHours = BankrollHourlySnapshotJob.LOOKBACK_HOURS,
  ): Promise<{ processed: number }> {
    const buckets = this.buildBuckets(lookbackHours);
    this.logger.warn(`🧨 RUN NOW | buckets=${buckets.length}`);

    for (const b of buckets) {
      await this.processBucket(b.bucketStart, b.start, b.end);
    }

    return { processed: buckets.length };
  }

  async processBucket(
    bucketStart: Date,
    start: Date,
    end: Date,
  ): Promise<void> {
    this.logger.log(
      `🧱 Bucket: ${bucketStart.toISOString()} [${start.toISOString()} -> ${end.toISOString()})`,
    );

    try {
      const existingIds = await this.getExistingBankrollIds(bucketStart);
      let lastId = 0;
      let totalCreated = 0;
      let totalSkipped = 0;

      while (true) {
        const bankrolls = await this.prisma.bankroll.findMany({
          where: { id: { gt: lastId } },
          orderBy: { id: 'asc' },
          take: BankrollHourlySnapshotJob.BATCH_SIZE,
          select: { id: true },
        });

        if (bankrolls.length === 0) break;
        lastId = bankrolls[bankrolls.length - 1].id;

        const bankrollIds = bankrolls
          .map((b) => b.id)
          .filter((id) => !existingIds.has(id));
        if (bankrollIds.length === 0) continue;

        const [hourlyHistories, { previousHistoryMap, previousSnapshotMap }] =
          await Promise.all([
            this.prisma.bankrollHistory.findMany({
              where: {
                bankrollId: { in: bankrollIds },
                date: { gte: start, lt: end },
              },
              orderBy: { date: 'asc' },
            }),
            this.snapshotService.fetchBucketContext(
              bankrollIds,
              bucketStart,
              start,
            ),
          ]);

        const historyMap = hourlyHistories.reduce<
          Record<number, BankrollHistoryDTO[]>
        >((acc, h) => {
          (acc[h.bankrollId] ??= []).push(h);
          return acc;
        }, {});

        const snapshots: CreateHourlySnapshotDTO[] = [];

        for (const { id } of bankrolls) {
          if (!bankrollIds.includes(id)) continue;

          try {
            const metrics = this.snapshotService.calculateMetrics(
              historyMap[id] ?? [],
              (previousHistoryMap.get(id) ??
                null) as PreviousHistoryData | null,
            );

            const prevSnapshot = (previousSnapshotMap.get(id) ??
              null) as PreviousSnapshotRow | null;

            if (
              prevSnapshot &&
              this.snapshotService.isEqualToPrevious(metrics, prevSnapshot)
            ) {
              totalSkipped++;
              continue;
            }

            snapshots.push({
              bankrollId: id,
              bucketStart,
              ...metrics,
            } satisfies CreateHourlySnapshotDTO);
          } catch (err) {
            this.logger.error(`❌ Bankroll ${id}:`, err);
          }
        }

        totalCreated +=
          await this.snapshotService.createManySnapshots(snapshots);
      }

      this.logger.log(
        `✅ ${bucketStart.toISOString()}: ${totalCreated} criados | ${totalSkipped} pulados`,
      );
    } catch (err) {
      this.logger.error(`💥 Bucket ${bucketStart.toISOString()}:`, err);
    }
  }

  // ─── Helpers privados ───────────────────────────────────────────────────────

  private buildBuckets(
    lookbackHours: number,
  ): { bucketStart: Date; start: Date; end: Date }[] {
    const endBase = DateTime.now()
      .setZone(BankrollHourlySnapshotJob.TIME_ZONE)
      .startOf('hour');

    return Array.from({ length: lookbackHours }, (_, i) => {
      const end = endBase.minus({ hours: i });
      const start = end.minus({ hours: 1 });
      return {
        bucketStart: start.toJSDate(), // ← DateTime → Date nativo
        start: start.toJSDate(),
        end: end.toJSDate(),
      };
    });
  }

  private async getExistingBankrollIds(
    bucketStart: Date,
  ): Promise<Set<number>> {
    const existing = await this.prisma.hourlySnapshot.findMany({
      where: { bucketStart },
      select: { bankrollId: true },
    });
    return new Set(existing.map((s) => s.bankrollId));
  }
}

// @Injectable()
// export class BankrollHourlySnapshotJob {
//   private readonly logger = new Logger(BankrollHourlySnapshotJob.name);
//   private static readonly BATCH_SIZE = 500;
//   private static readonly TIME_ZONE = 'America/Sao_Paulo';

//   // Backfill leve: tenta gerar hora anterior + mais 1 hora atrás (total 2 buckets).
//   // Se quiser “1–2 horas atrás”, deixe 2.
//   private static readonly LOOKBACK_HOURS = 2;

//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly snapshotService: BankrollHourlySnapshotService,
//     @Inject(forwardRef(() => QueueService))
//     private readonly queueService: QueueService,
//   ) {}

//   @Cron('0 7 * * * *', {
//     name: 'hourly-bankroll-snapshot',
//     timeZone: BankrollHourlySnapshotJob.TIME_ZONE,
//   })
//   async handleHourlySnapshot(): Promise<void> {
//     const endBase = DateTime.now()
//       .setZone(BankrollHourlySnapshotJob.TIME_ZONE)
//       .startOf('hour');

//     const buckets: HourlySnapshotJobData[] = [];

//     for (
//       let offset = 1;
//       offset <= BankrollHourlySnapshotJob.LOOKBACK_HOURS;
//       offset++
//     ) {
//       const end = endBase.minus({ hours: offset - 1 });
//       const start = end.minus({ hours: 1 });
//       const bucketStart = start;

//       buckets.push({
//         bucketStart: bucketStart.toJSDate().toISOString(),
//         start: start.toJSDate().toISOString(),
//         end: end.toJSDate().toISOString(),
//       });
//     }

//     const { queued } = await this.queueService.enqueueHourlyBuckets(buckets);
//     this.logger.log(`📬 ${queued} hourly-snapshot jobs enqueued`);
//   }

//   async runHourlyLookbackNow(
//     lookbackHours = BankrollHourlySnapshotJob.LOOKBACK_HOURS,
//   ): Promise<{ processed: number }> {
//     const endBase = DateTime.now()
//       .setZone(BankrollHourlySnapshotJob.TIME_ZONE)
//       .startOf('hour');

//     const buckets: { bucketStart: Date; start: Date; end: Date }[] = [];

//     for (let offset = 1; offset <= lookbackHours; offset++) {
//       const end = endBase.minus({ hours: offset - 1 });
//       const start = end.minus({ hours: 1 });

//       buckets.push({
//         bucketStart: start.toJSDate(),
//         start: start.toJSDate(),
//         end: end.toJSDate(),
//       });
//     }

//     this.logger.warn(
//       `🧨 RUN NOW hourly (admin) | buckets=${buckets.length} | lookbackHours=${lookbackHours}`,
//     );

//     // sequencial pra não estourar DB
//     for (const b of buckets) {
//       await this.processBucket(b.bucketStart, b.start, b.end);
//     }

//     return { processed: buckets.length };
//   }

//   async processBucket(
//     bucketStart: Date,
//     start: Date,
//     end: Date,
//   ): Promise<void> {
//     this.logger.log(
//       `🧱 Processando bucket: ${bucketStart.toISOString()}  [${start.toISOString()} -> ${end.toISOString()})`,
//     );

//     try {
//       // bankrollIds que já possuem snapshot nesse bucketStart
//       const existingSnapshots = await this.prisma.hourlySnapshot.findMany({
//         where: { bucketStart },
//         select: { bankrollId: true },
//       });
//       const existingIds = new Set(existingSnapshots.map((s) => s.bankrollId));

//       let lastBankrollId = 0;
//       let totalCreated = 0;
//       let totalSkippedEqualPrev = 0;

//       while (true) {
//         const bankrolls = await this.prisma.bankroll.findMany({
//           where: {
//             id: { gt: lastBankrollId },
//           },
//           orderBy: { id: 'asc' },
//           take: BankrollHourlySnapshotJob.BATCH_SIZE,
//           select: { id: true },
//         });

//         if (bankrolls.length === 0) break;
//         lastBankrollId = bankrolls[bankrolls.length - 1].id;

//         const bankrollIds = bankrolls
//           .map((b) => b.id)
//           .filter((id) => !existingIds.has(id));

//         if (bankrollIds.length === 0) {
//           continue;
//         }

//         const [hourlyHistories, previousHistories, previousSnapshots] =
//           await Promise.all([
//             // Histories do bucket
//             this.prisma.bankrollHistory.findMany({
//               where: {
//                 bankrollId: { in: bankrollIds },
//                 date: { gte: start, lt: end },
//               },
//               orderBy: { date: 'asc' },
//             }),

//             // Último history antes do bucket (pra ter start balance/unid)
//             this.prisma.$queryRaw<
//               Array<{
//                 bankrollId: number;
//                 balanceAfter: Decimal;
//                 unidValueAfter: Decimal;
//               }>
//             >`
//             SELECT DISTINCT ON ("bankrollId")
//               "bankrollId",
//               "balanceAfter",
//               "unidValueAfter"
//             FROM "bankroll_histories"
//             WHERE "bankrollId" IN (${Prisma.join(bankrollIds)})
//               AND "date" < ${start}
//             ORDER BY "bankrollId", "date" DESC, "id" DESC
//           `,

//             // Último snapshot antes do bucket (pra comparar e pular se igual)
//             this.prisma.$queryRaw<
//               Array<{
//                 bankrollId: number;
//                 balance: Decimal;
//                 unidValue: Decimal;
//                 hourlyProfit: Decimal;
//                 hourlyROI: Decimal;
//                 unitsChange: Decimal;
//                 peakBalance: Decimal;
//                 maxDrawdown: Decimal;
//                 hourlyDrawdown: Decimal;
//                 drawdownPercent: Decimal;
//                 betsPlaced: number;
//                 betsWon: number;
//                 betsLost: number;
//                 winRate: Decimal;
//               }>
//             >`
//             SELECT DISTINCT ON ("bankrollId")
//               "bankrollId",
//               "balance",
//               "unidValue",
//               "hourlyProfit",
//               "hourlyROI",
//               "unitsChange",
//               "peakBalance",
//               "maxDrawdown",
//               "hourlyDrawdown",
//               "drawdownPercent",
//               "betsPlaced",
//               "betsWon",
//               "betsLost",
//               "winRate"
//             FROM "snapshots_hourly"
//             WHERE "bankrollId" IN (${Prisma.join(bankrollIds)})
//               AND "bucketStart" < ${bucketStart}
//             ORDER BY "bankrollId", "bucketStart" DESC
//           `,
//           ]);

//         const historyMap = hourlyHistories.reduce<
//           Record<number, BankrollHistoryDTO[]>
//         >((acc, curr) => {
//           (acc[curr.bankrollId] ??= []).push(curr);
//           return acc;
//         }, {});

//         const previousHistoryMap = new Map(
//           previousHistories.map((p) => [p.bankrollId, p]),
//         );
//         const previousSnapshotMap = new Map(
//           previousSnapshots.map((p) => [p.bankrollId, p]),
//         );

//         const snapshotsToCreate: CreateHourlySnapshotDTO[] = [];

//         for (const bankroll of bankrolls) {
//           if (!bankrollIds.includes(bankroll.id)) continue;

//           try {
//             const hourly = historyMap[bankroll.id] ?? [];
//             const prevHistory = (previousHistoryMap.get(bankroll.id) ??
//               null) as PreviousHistoryData;
//             const prevSnapshot = (previousSnapshotMap.get(bankroll.id) ??
//               null) as PreviousSnapshotRow;

//             const metrics = this.calculateMetricsInMemory(hourly, prevHistory);

//             // Skip se for exatamente igual ao snapshot anterior
//             if (prevSnapshot && this.isEqualToPrevious(metrics, prevSnapshot)) {
//               totalSkippedEqualPrev++;
//               continue;
//             }

//             snapshotsToCreate.push({
//               bankrollId: bankroll.id,
//               bucketStart,
//               ...metrics,
//             });
//           } catch (error) {
//             this.logger.error(
//               `❌ Erro no cálculo do Bankroll ${bankroll.id}:`,
//               error,
//             );
//           }
//         }

//         if (snapshotsToCreate.length > 0) {
//           const createdCount =
//             await this.snapshotService.createManySnapshots(snapshotsToCreate);
//           totalCreated += createdCount;
//         }
//       }

//       this.logger.log(
//         `✅ Bucket concluído (${bucketStart.toISOString()}): ${totalCreated} criados | ${totalSkippedEqualPrev} pulados (iguais ao anterior).`,
//       );
//     } catch (error) {
//       this.logger.error(
//         `💥 Erro fatal no bucket ${bucketStart.toISOString()}:`,
//         error,
//       );
//     }
//   }

//   private isEqualToPrevious(
//     curr: Omit<CreateHourlySnapshotDTO, 'bankrollId' | 'bucketStart'>,
//     prev: NonNullable<PreviousSnapshotRow>,
//   ): boolean {
//     const toDecimal = (v: DecimalLike): Decimal =>
//       v instanceof Decimal ? v : new Decimal(v);

//     return (
//       toDecimal(curr.balance).equals(prev.balance) &&
//       toDecimal(curr.unidValue).equals(prev.unidValue) &&
//       toDecimal(curr.hourlyProfit).equals(prev.hourlyProfit) &&
//       toDecimal(curr.hourlyROI).equals(prev.hourlyROI) &&
//       toDecimal(curr.unitsChange).equals(prev.unitsChange) &&
//       toDecimal(curr.peakBalance).equals(prev.peakBalance) &&
//       toDecimal(curr.maxDrawdown).equals(prev.maxDrawdown) &&
//       toDecimal(curr.hourlyDrawdown).equals(prev.hourlyDrawdown) &&
//       toDecimal(curr.drawdownPercent).equals(prev.drawdownPercent) &&
//       curr.betsPlaced === prev.betsPlaced &&
//       curr.betsWon === prev.betsWon &&
//       curr.betsLost === prev.betsLost &&
//       toDecimal(curr.winRate).equals(prev.winRate)
//     );
//   }

//   private calculateMetricsInMemory(
//     hourlyHistories: BankrollHistoryDTO[],
//     previousHistory: PreviousHistoryData,
//   ) {
//     const ZERO = new Decimal(0);

//     const balanceStart = previousHistory?.balanceAfter ?? ZERO;
//     const balanceEnd = hourlyHistories.at(-1)?.balanceAfter ?? balanceStart;

//     const unidValueStart = previousHistory?.unidValueAfter ?? ZERO;
//     const unidValueEnd =
//       hourlyHistories.at(-1)?.unidValueAfter ?? unidValueStart;

//     const BET_TYPES = [
//       'BET_PLACED',
//       'BET_WIN',
//       'BET_LOSS',
//       'BET_VOID',
//     ] as const;

//     const hourlyProfit = hourlyHistories
//       .filter((h) => BET_TYPES.includes(h.type as (typeof BET_TYPES)[number]))
//       .reduce((acc, h) => acc.plus(h.amount), ZERO);

//     const hourlyROI = balanceStart.isZero()
//       ? ZERO
//       : hourlyProfit.dividedBy(balanceStart).times(100);

//     const unitsChange =
//       unidValueStart.isZero() || unidValueEnd.isZero()
//         ? ZERO
//         : balanceEnd
//             .dividedBy(unidValueEnd)
//             .minus(balanceStart.dividedBy(unidValueStart));

//     let peakBalance = balanceStart;
//     let maxDrawdown = ZERO;

//     for (const h of hourlyHistories) {
//       if (h.balanceAfter.greaterThan(peakBalance)) {
//         peakBalance = h.balanceAfter;
//       }

//       const drawdown = peakBalance.minus(h.balanceAfter);
//       if (drawdown.greaterThan(maxDrawdown)) {
//         maxDrawdown = drawdown;
//       }
//     }

//     const hourlyDrawdown = peakBalance.minus(balanceEnd);

//     const drawdownPercent = peakBalance.isZero()
//       ? ZERO
//       : hourlyDrawdown.dividedBy(peakBalance).times(100);

//     const betsPlaced = hourlyHistories.filter(
//       (h) => h.type === 'BET_PLACED',
//     ).length;
//     const betsWon = hourlyHistories.filter((h) => h.type === 'BET_WIN').length;
//     const betsLost = hourlyHistories.filter(
//       (h) => h.type === 'BET_LOSS',
//     ).length;

//     const winRate =
//       betsPlaced > 0
//         ? new Decimal(betsWon).dividedBy(betsPlaced).times(100)
//         : ZERO;

//     return {
//       balance: balanceEnd,
//       unidValue: unidValueEnd,
//       hourlyProfit,
//       hourlyROI,
//       unitsChange,
//       peakBalance,
//       maxDrawdown,
//       hourlyDrawdown,
//       drawdownPercent,
//       betsPlaced,
//       betsWon,
//       betsLost,
//       winRate,
//     };
//   }
// }

// bankrollHourlySnapshot.job.ts
