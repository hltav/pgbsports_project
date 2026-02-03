import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService, Decimal } from '../../../libs/database';
import { BankrollYearlySnapshotService } from '../snapshots/services/bankrollYearlySnapshot.service';
import { CreateYearlySnapshotDTO } from '../snapshots/dto/yearlySnapshot.dto';

type MonthlySnapshotData = {
  bankrollId: number;
  month: number;
  balance: Decimal;
  unidValue: Decimal;
  monthlyProfit: Decimal;
  peakBalance: Decimal;
  maxDrawdown: Decimal;
  betsPlaced: number;
  betsWon: number;
  betsLost: number;
};

type PreviousYearlyBase = {
  balance: Decimal;
  unidValue: Decimal;
} | null;

interface RawPreviousYearlyData {
  bankrollId: number;
  balance: Decimal;
  unidValue: Decimal;
}

@Injectable()
export class BankrollYearlySnapshotJob {
  private readonly logger = new Logger(BankrollYearlySnapshotJob.name);
  private static readonly BATCH_SIZE = 500;
  private static readonly MAX_ITERATIONS = 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly snapshotService: BankrollYearlySnapshotService,
  ) {}

  @Cron('3 0 1 1 *', {
    name: 'yearly-bankroll-snapshot',
    timeZone: 'America/Sao_Paulo',
  })
  async handleYearlySnapshot(): Promise<void> {
    const startTime = Date.now();
    const lastYear = new Date().getFullYear() - 1;

    this.logger.log(`📅 Iniciando snapshots anuais para o ano: ${lastYear}`);

    try {
      const stats = await this.processYearlySnapshots(lastYear);

      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ Snapshots anuais concluídos em ${duration}ms:\n` +
          `    - Total processado: ${stats.totalProcessed}\n` +
          `    - Criados: ${stats.totalCreated}\n` +
          `    - Erros: ${stats.totalErrors}`,
      );
    } catch (error) {
      this.logger.error('💥 Erro fatal no job anual:', error);
      throw error;
    }
  }

  private async processYearlySnapshots(year: number) {
    // 1. Identificar quem já tem snapshot para evitar duplicatas
    const existingSnapshots = await this.prisma.yearlySnapshot.findMany({
      where: { year },
      select: { bankrollId: true },
    });
    const existingIds = new Set(existingSnapshots.map((s) => s.bankrollId));

    let skip = 0;
    let totalCreated = 0;
    let totalProcessed = 0;
    let totalErrors = 0;
    let iterations = 0;

    while (iterations < BankrollYearlySnapshotJob.MAX_ITERATIONS) {
      iterations++;

      const bankrolls = await this.prisma.bankroll.findMany({
        skip,
        take: BankrollYearlySnapshotJob.BATCH_SIZE,
        select: { id: true, userId: true },
      });

      if (bankrolls.length === 0) break;

      const bankrollIds = bankrolls
        .map((b) => b.id)
        .filter((id) => !existingIds.has(id));

      totalProcessed += bankrolls.length;

      if (bankrollIds.length > 0) {
        try {
          const batchStats = await this.processBatch(bankrollIds, year);
          totalCreated += batchStats.created;
          totalErrors += batchStats.errors;
        } catch (error) {
          this.logger.error(`❌ Erro no batch anual ${iterations}:`, error);
          totalErrors += bankrollIds.length;
        }
      }

      skip += BankrollYearlySnapshotJob.BATCH_SIZE;
    }

    return { totalProcessed, totalCreated, totalErrors };
  }

  private async processBatch(bankrollIds: number[], year: number) {
    // Busca dados dos snapshots mensais para agregar o ano
    const [monthlySnapshots, previousSnapshots] = await Promise.all([
      this.prisma.monthlySnapshot.findMany({
        where: {
          bankrollId: { in: bankrollIds },
          year: year,
        },
        orderBy: { month: 'asc' },
        select: {
          bankrollId: true,
          month: true,
          balance: true,
          unidValue: true,
          monthlyProfit: true,
          peakBalance: true,
          maxDrawdown: true,
          betsPlaced: true,
          betsWon: true,
          betsLost: true,
        },
      }),

      // Otimização: Busca o último saldo do ano anterior (Dezembro ou antes)
      this.prisma.$queryRaw<RawPreviousYearlyData[]>`
    SELECT DISTINCT ON ("bankrollId")
      "bankrollId",
      "balance",
      "unidValue"
    FROM "snapshots_monthly"
    WHERE "bankrollId" IN (${Prisma.join(bankrollIds)})
      AND "year" < ${year}
    ORDER BY "bankrollId", "year" DESC, "month" DESC
  `,
    ]);

    const monthlyMap = monthlySnapshots.reduce<
      Record<number, MonthlySnapshotData[]>
    >((acc, curr) => {
      (acc[curr.bankrollId] ??= []).push(curr as MonthlySnapshotData);
      return acc;
    }, {});

    const previousMap = new Map<number, PreviousYearlyBase>(
      previousSnapshots.map((p) => [
        p.bankrollId,
        { balance: p.balance, unidValue: p.unidValue },
      ]),
    );

    const snapshotsToCreate: CreateYearlySnapshotDTO[] = [];
    let errors = 0;

    for (const bankrollId of bankrollIds) {
      const monthly = monthlyMap[bankrollId] ?? [];
      if (monthly.length === 0) continue;

      try {
        const previous = previousMap.get(bankrollId) ?? null;
        const metrics = this.aggregateYearlyFromMonthly(monthly, previous);

        snapshotsToCreate.push({
          bankrollId,
          year,
          ...metrics,
        });
      } catch {
        errors++;
      }
    }

    let created = 0;
    if (snapshotsToCreate.length > 0) {
      await this.prisma.$transaction(async (tx) => {
        created = await this.snapshotService.createManySnapshots(
          snapshotsToCreate,
          tx,
        );
      });
    }

    return { created, errors };
  }

  private aggregateYearlyFromMonthly(
    monthly: MonthlySnapshotData[],
    previous: PreviousYearlyBase,
  ) {
    const ZERO = new Decimal(0);
    const firstMonth = monthly[0];
    const lastMonth = monthly[monthly.length - 1];

    const balanceStart = previous?.balance ?? firstMonth.balance;
    const balanceEnd = lastMonth.balance;
    const unidValueStart = previous?.unidValue ?? firstMonth.unidValue;
    const unidValueEnd = lastMonth.unidValue;

    // const yearlyProfit = balanceEnd.minus(balanceStart);
    const yearlyProfit = monthly.reduce(
      (acc, m) => acc.plus(m.monthlyProfit),
      ZERO,
    );
    const yearlyROI = balanceStart.isZero()
      ? ZERO
      : yearlyProfit.dividedBy(balanceStart).times(100);

    const unitsChange = unidValueStart.isZero()
      ? ZERO
      : balanceEnd
          .dividedBy(unidValueEnd)
          .minus(balanceStart.dividedBy(unidValueStart));

    // Agrega pico e drawdown máximo observados nos meses
    const peakBalance = monthly.reduce(
      (max, m) => (m.peakBalance.gt(max) ? m.peakBalance : max),
      balanceStart,
    );
    const maxDrawdown = monthly.reduce(
      (max, m) => (m.maxDrawdown.gt(max) ? m.maxDrawdown : max),
      ZERO,
    );

    const betsPlaced = monthly.reduce((sum, m) => sum + m.betsPlaced, 0);
    const betsWon = monthly.reduce((sum, m) => sum + m.betsWon, 0);
    const betsLost = monthly.reduce((sum, m) => sum + m.betsLost, 0);

    return {
      balance: balanceEnd,
      unidValue: unidValueEnd,
      yearlyProfit,
      yearlyROI,
      unitsChange,
      peakBalance,
      maxDrawdown,
      drawdownPercent: peakBalance.isZero()
        ? ZERO
        : maxDrawdown.div(peakBalance).times(100),
      betsPlaced,
      betsWon,
      betsLost,
      winRate:
        betsPlaced > 0 ? new Decimal(betsWon).div(betsPlaced).times(100) : ZERO,
    };
  }
}
