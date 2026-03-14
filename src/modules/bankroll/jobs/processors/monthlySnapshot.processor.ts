import { Logger } from '@nestjs/common';
import { Decimal, PrismaService } from './../../../../libs/database';
import { BankrollMonthlySnapshotService } from '../../snapshots/services/bankrollMonthlySnapshot.service';
import { CreateMonthlySnapshotDTO } from '../../snapshots/dto/monthlySnapshot.dto';
import {
  PreviousMonthlySnapshotData,
  WeeklySnapshotData,
} from '../schemas/monthlySnapshot.schema';

export function createMonthlySnapshotProcessor(params: {
  prisma: PrismaService;
  snapshotService: BankrollMonthlySnapshotService;
  logger: Logger;
  year: number;
  month: number;
  firstWeek: number;
  lastWeek: number;
}) {
  const { prisma, snapshotService, logger, year, month, firstWeek, lastWeek } =
    params;

  return async function processMonthlyBatch(
    bankrollIds: number[],
  ): Promise<{ created: number; noData: number; errors: number }> {
    const ZERO = new Decimal(0);

    const [weeklySnapshots, previousMonthlySnapshots] = await Promise.all([
      prisma.weeklySnapshot.findMany({
        where: {
          bankrollId: { in: bankrollIds },
          year,
          week: { gte: firstWeek, lte: lastWeek },
        },
        orderBy: { week: 'asc' },
        select: {
          bankrollId: true,
          week: true,
          balance: true,
          unidValue: true,
          weeklyProfit: true,
          peakBalance: true,
          maxDrawdown: true,
          betsPlaced: true,
          betsWon: true,
          betsLost: true,
        },
      }),

      prisma.monthlySnapshot.findMany({
        where: {
          bankrollId: { in: bankrollIds },
          OR: [
            { year: { lt: year } },
            { AND: [{ year }, { month: { lt: month } }] },
          ],
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        select: {
          bankrollId: true,
          balance: true,
          unidValue: true,
        },
      }),
    ]);

    // -----------------------------
    // Agrupar snapshots semanais
    // -----------------------------
    const weeklyMap = weeklySnapshots.reduce<
      Record<number, WeeklySnapshotData[]>
    >((acc, curr) => {
      (acc[curr.bankrollId] ??= []).push(curr as WeeklySnapshotData);
      return acc;
    }, {});

    // -----------------------------
    // Mapear snapshot mensal anterior
    // -----------------------------
    const previousMap = new Map<number, PreviousMonthlySnapshotData>();
    for (const snapshot of previousMonthlySnapshots) {
      if (!previousMap.has(snapshot.bankrollId)) {
        previousMap.set(snapshot.bankrollId, {
          balance: snapshot.balance,
          unidValue: snapshot.unidValue,
        });
      }
    }

    const snapshotsToCreate: CreateMonthlySnapshotDTO[] = [];
    let noData = 0;
    let errors = 0;

    // -----------------------------
    // Processar cada bankroll
    // -----------------------------
    for (const bankrollId of bankrollIds) {
      try {
        const weekly = weeklyMap[bankrollId] ?? [];

        if (weekly.length === 0) {
          logger.debug(
            `⚠️  Bankroll ${bankrollId}: sem snapshots semanais (${month}/${year})`,
          );
          noData++;
          continue;
        }

        const previous = previousMap.get(bankrollId) ?? null;

        const firstWeekData = weekly[0];
        const lastWeekData = weekly[weekly.length - 1];

        const balanceStart = previous?.balance ?? firstWeekData.balance;
        const balanceEnd = lastWeekData.balance;

        const unidValueStart = previous?.unidValue ?? firstWeekData.unidValue;
        const unidValueEnd = lastWeekData.unidValue;

        const monthlyProfit = weekly.reduce(
          (acc, w) => acc.plus(w.weeklyProfit),
          ZERO,
        );

        const monthlyROI = balanceStart.isZero()
          ? ZERO
          : monthlyProfit.dividedBy(balanceStart).times(100);

        const unitsChange = unidValueStart.isZero()
          ? ZERO
          : balanceEnd
              .dividedBy(unidValueEnd)
              .minus(balanceStart.dividedBy(unidValueStart));

        let peakBalance = balanceStart;
        let maxDrawdown = ZERO;

        for (const w of weekly) {
          if (w.peakBalance.greaterThan(peakBalance)) {
            peakBalance = w.peakBalance;
          }
          if (w.maxDrawdown.greaterThan(maxDrawdown)) {
            maxDrawdown = w.maxDrawdown;
          }
        }

        const drawdownPercent = peakBalance.isZero()
          ? ZERO
          : maxDrawdown.dividedBy(peakBalance).times(100);

        const betsPlaced = weekly.reduce((sum, w) => sum + w.betsPlaced, 0);
        const betsWon = weekly.reduce((sum, w) => sum + w.betsWon, 0);
        const betsLost = weekly.reduce((sum, w) => sum + w.betsLost, 0);

        const winRate =
          betsPlaced > 0
            ? new Decimal(betsWon).dividedBy(betsPlaced).times(100)
            : ZERO;

        snapshotsToCreate.push({
          bankrollId,
          year,
          month,
          balance: balanceEnd,
          unidValue: unidValueEnd,
          monthlyProfit,
          monthlyROI,
          unitsChange,
          peakBalance,
          maxDrawdown,
          drawdownPercent,
          betsPlaced,
          betsWon,
          betsLost,
          winRate,
        });
      } catch (err) {
        logger.error(
          `❌ Erro ao calcular snapshot mensal do bankroll ${bankrollId}`,
          err,
        );
        errors++;
      }
    }

    // -----------------------------
    // Persistência em batch
    // -----------------------------
    let created = 0;

    if (snapshotsToCreate.length > 0) {
      try {
        await prisma.$transaction(async (tx) => {
          created = await snapshotService.createManySnapshots(
            snapshotsToCreate,
            tx,
          );
        });

        logger.debug(`✅ Batch mensal: ${created} snapshots criados`);
      } catch (err) {
        logger.error('❌ Erro ao criar snapshots mensais em batch', err);
        errors += snapshotsToCreate.length;
      }
    }

    return { created, noData, errors };
  };
}
