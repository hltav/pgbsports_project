import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService, Decimal } from '../../../libs/database';
import { BankrollMonthlySnapshotService } from '../snapshots/services/bankrollMonthlySnapshot.service';
import { CreateMonthlySnapshotDTO } from '../snapshots/dto/monthlySnapshot.dto';
import { QueueService } from './../../../libs/services/queue/queue.service';

type PreviousMonthlySnapshotData = {
  balance: Decimal;
  unidValue: Decimal;
} | null;

type WeeklySnapshotData = {
  bankrollId: number;
  week: number;
  balance: Decimal;
  unidValue: Decimal;
  weeklyProfit: Decimal;
  peakBalance: Decimal;
  maxDrawdown: Decimal;
  betsPlaced: number;
  betsWon: number;
  betsLost: number;
};

@Injectable()
export class BankrollMonthlySnapshotJob {
  private readonly logger = new Logger(BankrollMonthlySnapshotJob.name);
  private static readonly BATCH_SIZE = 300;
  private static readonly MAX_ITERATIONS = 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly snapshotService: BankrollMonthlySnapshotService,
    @Inject(forwardRef(() => QueueService))
    private readonly queueService: QueueService,
  ) {}

  // Executa no primeiro dia de cada mês às 00:01
  // Gera snapshot do mês anterior
  @Cron('1 0 1 * *', {
    name: 'monthly-bankroll-snapshot',
    timeZone: 'America/Sao_Paulo',
  })
  async handleMonthlySnapshot(): Promise<void> {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1;
    await this.queueService.enqueueMonthlySnapshot(year, month);
    this.logger.log(`📬 monthly-snapshot ${month}/${year} enqueued`);
  }

  async processMonthlySnapshot(year: number, month: number): Promise<void> {
    const { firstWeek, lastWeek } = this.getMonthWeekRange(year, month);
    await this.processMonthlySnapshots(year, month, firstWeek, lastWeek);
  }

  async processMonthlySnapshots(
    year: number,
    month: number,
    firstWeek: number,
    lastWeek: number,
  ): Promise<{
    totalProcessed: number;
    totalCreated: number;
    totalSkipped: number;
    totalNoData: number;
    totalErrors: number;
  }> {
    // Buscar snapshots já existentes
    const existingSnapshots = await this.prisma.monthlySnapshot.findMany({
      where: { year, month },
      select: { bankrollId: true },
    });

    const existingIds = new Set(existingSnapshots.map((s) => s.bankrollId));
    this.logger.log(`📋 ${existingIds.size} snapshots já existem`);

    let skip = 0;
    let totalCreated = 0;
    let totalProcessed = 0;
    let totalSkipped = 0;
    let totalNoData = 0;
    let totalErrors = 0;
    let iterations = 0;

    while (iterations < BankrollMonthlySnapshotJob.MAX_ITERATIONS) {
      iterations++;

      const bankrolls = await this.prisma.bankroll.findMany({
        skip,
        take: BankrollMonthlySnapshotJob.BATCH_SIZE,
        select: { id: true },
      });

      if (bankrolls.length === 0) {
        this.logger.log('✅ Todos os bankrolls foram processados');
        break;
      }

      const bankrollIds = bankrolls
        .map((b) => b.id)
        .filter((id) => !existingIds.has(id));

      totalProcessed += bankrolls.length;

      if (bankrollIds.length === 0) {
        totalSkipped += bankrolls.length;
        skip += BankrollMonthlySnapshotJob.BATCH_SIZE;
        this.logger.debug(
          `⏭️  Batch ${iterations}: ${bankrolls.length} já processados`,
        );
        continue;
      }

      this.logger.debug(
        `🔄 Batch ${iterations}: processando ${bankrollIds.length} bankrolls`,
      );

      try {
        const batchStats = await this.processBatch(
          bankrollIds,
          year,
          month,
          firstWeek,
          lastWeek,
        );

        totalCreated += batchStats.created;
        totalNoData += batchStats.noData;
        totalErrors += batchStats.errors;
      } catch (error) {
        this.logger.error(`❌ Erro no batch ${iterations}:`, error);
        totalErrors += bankrollIds.length;
      }

      skip += BankrollMonthlySnapshotJob.BATCH_SIZE;
    }

    if (iterations >= BankrollMonthlySnapshotJob.MAX_ITERATIONS) {
      this.logger.warn(
        `⚠️  Limite de ${BankrollMonthlySnapshotJob.MAX_ITERATIONS} iterações atingido`,
      );
    }

    return {
      totalProcessed,
      totalCreated,
      totalSkipped,
      totalNoData,
      totalErrors,
    };
  }

  private async processBatch(
    bankrollIds: number[],
    year: number,
    month: number,
    firstWeek: number,
    lastWeek: number,
  ): Promise<{ created: number; noData: number; errors: number }> {
    const [weeklySnapshots, previousMonthlySnapshots] = await Promise.all([
      this.prisma.weeklySnapshot.findMany({
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

      this.prisma.monthlySnapshot.findMany({
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

    // Agrupar snapshots semanais por bankroll
    const weeklyMap = weeklySnapshots.reduce<
      Record<number, WeeklySnapshotData[]>
    >((acc, curr) => {
      (acc[curr.bankrollId] ??= []).push(curr as WeeklySnapshotData);
      return acc;
    }, {});

    // Mapear snapshots anteriores (pegar apenas o mais recente de cada bankroll)
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

    for (const bankrollId of bankrollIds) {
      try {
        const weekly = weeklyMap[bankrollId] ?? [];

        if (weekly.length === 0) {
          this.logger.debug(
            `⚠️  Bankroll ${bankrollId}: sem snapshots semanais para ${month}/${year}`,
          );
          noData++;
          continue;
        }

        const previous = previousMap.get(bankrollId) ?? null;

        const metrics = this.calculateMonthlyMetricsFromWeekly(
          weekly,
          previous,
        );

        snapshotsToCreate.push({
          bankrollId,
          year,
          month,
          ...metrics,
        });
      } catch (error) {
        this.logger.error(
          `❌ Erro ao calcular snapshot mensal do Bankroll ${bankrollId}:`,
          error,
        );
        errors++;
      }
    }

    let created = 0;

    if (snapshotsToCreate.length > 0) {
      try {
        // Criar snapshots em transação
        await this.prisma.$transaction(async (tx) => {
          created = await this.snapshotService.createManySnapshots(
            snapshotsToCreate,
            tx,
          );
        });

        this.logger.debug(`✅ Batch: ${created} snapshots criados`);
      } catch (error) {
        this.logger.error('❌ Erro ao criar snapshots em batch:', error);
        errors += snapshotsToCreate.length;
      }
    }

    return { created, noData, errors };
  }

  /**
   * Calcula o range de semanas para um determinado mês
   */
  private getMonthWeekRange(
    year: number,
    month: number,
  ): { firstWeek: number; lastWeek: number } {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);

    const firstWeek = this.getWeekNumber(firstDayOfMonth);
    const lastWeek = this.getWeekNumber(lastDayOfMonth);

    return { firstWeek, lastWeek };
  }

  /**
   * Calcula o número da semana ISO 8601
   */
  private getWeekNumber(date: Date): number {
    const target = new Date(date.valueOf());
    const dayNumber = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNumber + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  }

  /**
   * Agrega snapshots semanais em métricas mensais
   */
  private calculateMonthlyMetricsFromWeekly(
    weeklySnapshots: WeeklySnapshotData[],
    previousSnapshot: PreviousMonthlySnapshotData,
  ) {
    const ZERO = new Decimal(0);

    if (weeklySnapshots.length === 0) {
      throw new Error('Nenhum snapshot semanal fornecido');
    }

    const firstWeek = weeklySnapshots[0];
    const lastWeek = weeklySnapshots[weeklySnapshots.length - 1];

    // Balance inicial e final
    const balanceStart = previousSnapshot?.balance ?? firstWeek.balance;
    const balanceEnd = lastWeek.balance;

    // Unid value inicial e final
    const unidValueStart = previousSnapshot?.unidValue ?? firstWeek.unidValue;
    const unidValueEnd = lastWeek.unidValue;

    // Profit mensal
    //const monthlyProfit = balanceEnd.minus(balanceStart);
    const monthlyProfit = weeklySnapshots.reduce(
      (acc, d) => acc.plus(d.weeklyProfit),
      ZERO,
    );

    // ROI mensal
    const monthlyROI = balanceStart.isZero()
      ? ZERO
      : monthlyProfit.dividedBy(balanceStart).times(100);

    // Mudança em unidades
    const unitsChange = unidValueStart.isZero()
      ? ZERO
      : balanceEnd
          .dividedBy(unidValueEnd)
          .minus(balanceStart.dividedBy(unidValueStart));

    // Peak balance e max drawdown
    let peakBalance = balanceStart;
    let maxDrawdown = ZERO;

    for (const w of weeklySnapshots) {
      if (w.peakBalance.greaterThan(peakBalance)) {
        peakBalance = w.peakBalance;
      }
      if (w.maxDrawdown.greaterThan(maxDrawdown)) {
        maxDrawdown = w.maxDrawdown;
      }
    }

    // Drawdown percentual
    const drawdownPercent = peakBalance.isZero()
      ? ZERO
      : maxDrawdown.dividedBy(peakBalance).times(100);

    // Agregação de apostas
    const betsPlaced = weeklySnapshots.reduce(
      (sum, w) => sum + w.betsPlaced,
      0,
    );
    const betsWon = weeklySnapshots.reduce((sum, w) => sum + w.betsWon, 0);
    const betsLost = weeklySnapshots.reduce((sum, w) => sum + w.betsLost, 0);

    // Win rate
    const winRate =
      betsPlaced > 0
        ? new Decimal(betsWon).dividedBy(betsPlaced).times(100)
        : ZERO;

    return {
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
    };
  }
}
