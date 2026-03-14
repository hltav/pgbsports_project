import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Decimal, PrismaService } from './../../../libs/database';
import { BankrollDailySnapshotService } from '../snapshots/services/bankrollDailySnapshot.service';
import { BankrollHistoryDTO } from '../z.dto/history/bankrollHistory.dto';
import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { CreateDailySnapshotDTO } from '../snapshots/dto/dailySnapshot.dto';
import {
  HourlySnapshotRow,
  PreviousHourlyStateRow,
  PreviousSnapshotData,
} from '../snapshots/types/bankrollDaily.types';
import { QueueService } from './../../../libs/services/queue/queue.service';

@Injectable()
export class BankrollDailySnapshotJob {
  private readonly logger = new Logger(BankrollDailySnapshotJob.name);
  private static readonly BATCH_SIZE = 500;
  private static readonly TIME_ZONE = 'America/Sao_Paulo';

  constructor(
    private readonly prisma: PrismaService,
    private readonly snapshotService: BankrollDailySnapshotService,
    @Inject(forwardRef(() => QueueService))
    private readonly queueService: QueueService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'daily-bankroll-snapshot',
    timeZone: BankrollDailySnapshotJob.TIME_ZONE,
  })
  async handleDailySnapshot(): Promise<void> {
    await this.queueService.enqueueDailySnapshot(new Date());
    this.logger.log('📬 daily-snapshot job enqueued');
  }

  async processDailySnapshot(): Promise<void> {
    return this.runDailySnapshot();
  }

  private async runDailySnapshot(): Promise<void> {
    this.logger.log('🕐 Iniciando geração de snapshots diários (batch)...');

    const yesterdayBase = DateTime.now()
      .setZone(BankrollDailySnapshotJob.TIME_ZONE)
      .startOf('day')
      .minus({ days: 1 });

    const todayBase = yesterdayBase.plus({ days: 1 });

    const year = yesterdayBase.year;
    const month = yesterdayBase.month;
    const day = yesterdayBase.day;
    const yesterday = yesterdayBase.toJSDate();
    const today = todayBase.toJSDate();

    try {
      const existingSnapshots = await this.prisma.dailySnapshot.findMany({
        where: { year, month, day },
        select: { bankrollId: true },
      });
      const existingIds = new Set(existingSnapshots.map((s) => s.bankrollId));

      let lastBankrollId = 0;
      let totalCreated = 0;
      let totalFromHourly = 0;
      let totalFromHistoryFallback = 0;

      while (true) {
        const bankrolls = await this.prisma.bankroll.findMany({
          where: {
            id: { gt: lastBankrollId },
          },
          orderBy: { id: 'asc' },
          take: BankrollDailySnapshotJob.BATCH_SIZE,
          select: { id: true },
        });

        if (bankrolls.length === 0) break;
        lastBankrollId = bankrolls[bankrolls.length - 1].id;

        const bankrollIds = bankrolls
          .map((b) => b.id)
          .filter((id) => !existingIds.has(id));
        const bankrollIdSet = new Set(bankrollIds);

        if (bankrollIds.length === 0) {
          continue;
        }

        // 1) Preferência: calcular via hourly snapshots do dia
        // 2) Fallback: usar bankroll_histories como hoje (caso não existam hourlies)
        const [
          hourliesOfDay,
          previousHourlyStates,
          dailyHistories,
          previousHistories,
        ] = await Promise.all([
          // Hourlies do dia (00:00 -> 24:00)
          this.prisma.hourlySnapshot.findMany({
            where: {
              bankrollId: { in: bankrollIds },
              bucketStart: { gte: yesterday, lt: today },
            },
            select: {
              bankrollId: true,
              bucketStart: true,
              balance: true,
              unidValue: true,
              hourlyProfit: true,
              betsPlaced: true,
              betsWon: true,
              betsLost: true,
            },
            orderBy: [{ bankrollId: 'asc' }, { bucketStart: 'asc' }],
          }),

          // Estado anterior ao dia: último hourly < yesterday (para start balance/unid)
          this.prisma.$queryRaw<PreviousHourlyStateRow[]>`
              SELECT DISTINCT ON ("bankrollId")
                "bankrollId",
                "balance",
                "unidValue"
              FROM "snapshots_hourly"
              WHERE "bankrollId" IN (${Prisma.join(bankrollIds)})
                AND "bucketStart" < ${yesterday}
              ORDER BY "bankrollId", "bucketStart" DESC, "id" DESC
            `,

          // Fallback: histories do dia
          this.prisma.bankrollHistory.findMany({
            where: {
              bankrollId: { in: bankrollIds },
              date: { gte: yesterday, lt: today },
            },
            orderBy: { date: 'asc' },
          }),

          // Fallback: estado anterior via histories (se não tiver hourly anterior)
          this.prisma.$queryRaw<
            Array<{
              bankrollId: number;
              balanceAfter: Decimal;
              unidValueAfter: Decimal;
            }>
          >`
              SELECT DISTINCT ON ("bankrollId")
                "bankrollId",
                "balanceAfter",
                "unidValueAfter"
              FROM "bankroll_histories"
              WHERE "bankrollId" IN (${Prisma.join(bankrollIds)})
                AND "date" < ${yesterday}
              ORDER BY "bankrollId", "date" DESC, "id" DESC
            `,
        ]);

        // Agrupa hourlies por bankrollId
        const hourlyMap = hourliesOfDay.reduce<
          Record<number, HourlySnapshotRow[]>
        >((acc, curr) => {
          (acc[curr.bankrollId] ??= []).push(curr);
          return acc;
        }, {});

        // Previous hourly state map
        const prevHourlyMap = new Map<number, PreviousSnapshotData>(
          previousHourlyStates.map((p) => [
            p.bankrollId,
            { balanceAfter: p.balance, unidValueAfter: p.unidValue },
          ]),
        );

        // Fallback maps (history)
        const historyMap = dailyHistories.reduce<
          Record<number, BankrollHistoryDTO[]>
        >((acc, curr) => {
          (acc[curr.bankrollId] ??= []).push(curr);
          return acc;
        }, {});

        const previousHistoryMap = new Map<number, PreviousSnapshotData>(
          previousHistories.map((p) => [
            p.bankrollId,
            { balanceAfter: p.balanceAfter, unidValueAfter: p.unidValueAfter },
          ]),
        );

        const snapshotsToCreate: CreateDailySnapshotDTO[] = [];

        for (const bankroll of bankrolls) {
          if (!bankrollIdSet.has(bankroll.id)) continue;

          try {
            const hs = hourlyMap[bankroll.id] ?? [];

            // Preferência: hourly -> daily
            if (hs.length > 0) {
              // Start do dia: preferir prevHourly; se não tiver, usar prevHistory
              const prev =
                prevHourlyMap.get(bankroll.id) ??
                previousHistoryMap.get(bankroll.id) ??
                null;

              const metrics = this.calculateDailyFromHourlies(hs, prev);

              snapshotsToCreate.push({
                bankrollId: bankroll.id,
                year,
                month,
                day,
                ...metrics,
              });

              totalFromHourly++;
              continue;
            }

            // Fallback: histories -> daily
            const daily = historyMap[bankroll.id] ?? [];
            const prev = previousHistoryMap.get(bankroll.id) ?? null;

            const metrics = this.calculateMetricsInMemory(daily, prev);

            snapshotsToCreate.push({
              bankrollId: bankroll.id,
              year,
              month,
              day,
              ...metrics,
            });

            totalFromHistoryFallback++;
          } catch (error) {
            this.logger.error(
              `❌ Erro no cálculo do Bankroll ${bankroll.id}:`,
              error,
            );
          }
        }

        if (snapshotsToCreate.length > 0) {
          const createdCount =
            await this.snapshotService.createManySnapshots(snapshotsToCreate);
          totalCreated += createdCount;
        }
      }

      this.logger.log(
        `✅ Snapshot diário concluído: ${totalCreated} criados | via hourly: ${totalFromHourly} | fallback history: ${totalFromHistoryFallback}`,
      );
    } catch (error) {
      this.logger.error('💥 Erro fatal no job de snapshot:', error);
    }
  }

  private calculateDailyFromHourlies(
    hourlies: HourlySnapshotRow[],
    previousState: PreviousSnapshotData,
  ) {
    const ZERO = new Decimal(0);

    const balanceStart = previousState?.balanceAfter ?? ZERO;
    const unidValueStart = previousState?.unidValueAfter ?? ZERO;

    const last = hourlies.at(-1);
    const balanceEnd = last?.balance ?? balanceStart;
    const unidValueEnd = last?.unidValue ?? unidValueStart;

    // const dailyProfit = balanceEnd.minus(balanceStart);

    // const dailyROI = balanceStart.isZero()
    //   ? ZERO
    //   : dailyProfit.dividedBy(balanceStart).times(100);

    const dailyProfit = hourlies.reduce(
      (acc, h) => acc.plus(h.hourlyProfit),
      ZERO,
    );

    const dailyROI = balanceStart.isZero()
      ? ZERO
      : dailyProfit.dividedBy(balanceStart).times(100);

    const unitsChange =
      unidValueStart.isZero() || unidValueEnd.isZero()
        ? ZERO
        : balanceEnd
            .dividedBy(unidValueEnd)
            .minus(balanceStart.dividedBy(unidValueStart));

    const betsPlaced = hourlies.reduce((acc, h) => acc + h.betsPlaced, 0);
    const betsWon = hourlies.reduce((acc, h) => acc + h.betsWon, 0);
    const betsLost = hourlies.reduce((acc, h) => acc + h.betsLost, 0);

    const winRate =
      betsPlaced > 0
        ? new Decimal(betsWon).dividedBy(betsPlaced).times(100)
        : ZERO;

    // Drawdown do dia (com peak acumulado)
    let peakBalance = balanceStart;
    let maxDrawdown = ZERO;

    for (const h of hourlies) {
      if (h.balance.greaterThan(peakBalance)) {
        peakBalance = h.balance;
      }

      const drawdown = peakBalance.minus(h.balance);
      if (drawdown.greaterThan(maxDrawdown)) {
        maxDrawdown = drawdown;
      }
    }

    const dailyDrawdown = peakBalance.minus(balanceEnd);

    const drawdownPercent = peakBalance.isZero()
      ? ZERO
      : dailyDrawdown.dividedBy(peakBalance).times(100);

    return {
      balance: balanceEnd,
      unidValue: unidValueEnd,
      dailyProfit,
      dailyROI,
      unitsChange,
      peakBalance,
      maxDrawdown,
      dailyDrawdown,
      drawdownPercent,
      betsPlaced,
      betsWon,
      betsLost,
      winRate,
    };
  }

  // Fallback original
  private calculateMetricsInMemory(
    dailyHistories: BankrollHistoryDTO[],
    previousHistory: PreviousSnapshotData,
  ) {
    const ZERO = new Decimal(0);

    const balanceStart = previousHistory?.balanceAfter ?? ZERO;
    const balanceEnd = dailyHistories.at(-1)?.balanceAfter ?? balanceStart;

    const unidValueStart = previousHistory?.unidValueAfter ?? ZERO;
    const unidValueEnd =
      dailyHistories.at(-1)?.unidValueAfter ?? unidValueStart;

    const BET_TYPES = [
      'BET_PLACED',
      'BET_WIN',
      'BET_LOSS',
      'BET_VOID',
    ] as const;

    const dailyProfit = dailyHistories
      .filter((h) => BET_TYPES.includes(h.type as (typeof BET_TYPES)[number]))
      .reduce((acc, h) => acc.plus(h.amount), ZERO);

    const dailyROI = balanceStart.isZero()
      ? ZERO
      : dailyProfit.dividedBy(balanceStart).times(100);

    const unitsChange =
      unidValueStart.isZero() || unidValueEnd.isZero()
        ? ZERO
        : balanceEnd
            .dividedBy(unidValueEnd)
            .minus(balanceStart.dividedBy(unidValueStart));

    let peakBalance = balanceStart;
    let maxDrawdown = ZERO;

    for (const h of dailyHistories) {
      if (h.balanceAfter.greaterThan(peakBalance)) {
        peakBalance = h.balanceAfter;
      }

      const drawdown = peakBalance.minus(h.balanceAfter);
      if (drawdown.greaterThan(maxDrawdown)) {
        maxDrawdown = drawdown;
      }
    }

    const dailyDrawdown = peakBalance.minus(balanceEnd);

    const drawdownPercent = peakBalance.isZero()
      ? ZERO
      : dailyDrawdown.dividedBy(peakBalance).times(100);

    const betsPlaced = dailyHistories.filter(
      (h) => h.type === 'BET_PLACED',
    ).length;
    const betsWon = dailyHistories.filter((h) => h.type === 'BET_WIN').length;
    const betsLost = dailyHistories.filter((h) => h.type === 'BET_LOSS').length;

    const winRate =
      betsPlaced > 0
        ? new Decimal(betsWon).dividedBy(betsPlaced).times(100)
        : ZERO;

    return {
      balance: balanceEnd,
      unidValue: unidValueEnd,
      dailyProfit,
      dailyROI,
      unitsChange,
      peakBalance,
      maxDrawdown,
      dailyDrawdown,
      drawdownPercent,
      betsPlaced,
      betsWon,
      betsLost,
      winRate,
    };
  }
}
