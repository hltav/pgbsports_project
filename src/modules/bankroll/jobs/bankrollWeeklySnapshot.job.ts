import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { Decimal, PrismaService } from '../../../libs/database';
import { BankrollWeeklySnapshotService } from '../snapshots/services/bankrollWeeklySnapshot.service';
import { CreateWeeklySnapshotDTO } from '../snapshots/dto/weeklySnapshot.dto';

type DailySnapshotAggregateInput = {
  bankrollId: number;
  balance: Decimal;
  unidValue: Decimal;
  dailyProfit: Decimal;
  peakBalance: Decimal;
  maxDrawdown: Decimal;
  betsPlaced: number;
  betsWon: number;
  betsLost: number;
};

type PreviousWeeklyBase = {
  balance: Decimal;
  unidValue: Decimal;
} | null;

@Injectable()
export class BankrollWeeklySnapshotJob {
  private readonly logger = new Logger(BankrollWeeklySnapshotJob.name);
  private static readonly BATCH_SIZE = 500;
  private static readonly MAX_ITERATIONS = 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly snapshotService: BankrollWeeklySnapshotService,
  ) {}

  /**
   * Executa toda segunda-feira à 00:00
   * Gera snapshot da semana ISO anterior
   */
  @Cron(CronExpression.EVERY_WEEK, {
    name: 'weekly-bankroll-snapshot',
    timeZone: 'America/Sao_Paulo',
  })
  async handleWeeklySnapshot(): Promise<void> {
    const startTime = Date.now();
    this.logger.log(
      '📅 Iniciando geração de snapshots semanais (agregando DailySnapshot)...',
    );

    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);

    const { year, week } = this.getISOWeek(lastWeek);
    const { startOfWeek, endOfWeek } = this.getWeekBounds(year, week);

    this.logger.log(
      `📊 Processando semana ${week}/${year} (${this.formatDate(startOfWeek)} - ${this.formatDate(endOfWeek)})`,
    );

    try {
      const stats = await this.processWeeklySnapshots(
        year,
        week,
        startOfWeek,
        endOfWeek,
      );

      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ Snapshots semanais concluídos em ${duration}ms:\n` +
          `   - Total processado: ${stats.totalProcessed}\n` +
          `   - Criados: ${stats.totalCreated}\n` +
          `   - Já existentes: ${stats.totalSkipped}\n` +
          `   - Sem dados: ${stats.totalNoData}\n` +
          `   - Erros: ${stats.totalErrors}`,
      );
    } catch (error) {
      this.logger.error('💥 Erro fatal no job semanal:', error);
      throw error;
    }
  }

  private async processWeeklySnapshots(
    year: number,
    week: number,
    startOfWeek: Date,
    endOfWeek: Date,
  ): Promise<{
    totalProcessed: number;
    totalCreated: number;
    totalSkipped: number;
    totalNoData: number;
    totalErrors: number;
  }> {
    // Buscar snapshots já existentes
    const existingSnapshots = await this.prisma.weeklySnapshot.findMany({
      where: { year, week },
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

    while (iterations < BankrollWeeklySnapshotJob.MAX_ITERATIONS) {
      iterations++;

      const bankrolls = await this.prisma.bankroll.findMany({
        skip,
        take: BankrollWeeklySnapshotJob.BATCH_SIZE,
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
        skip += BankrollWeeklySnapshotJob.BATCH_SIZE;
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
          week,
          startOfWeek,
          endOfWeek,
        );

        totalCreated += batchStats.created;
        totalNoData += batchStats.noData;
        totalErrors += batchStats.errors;
      } catch (error) {
        this.logger.error(`❌ Erro no batch ${iterations}:`, error);
        totalErrors += bankrollIds.length;
      }

      skip += BankrollWeeklySnapshotJob.BATCH_SIZE;
    }

    if (iterations >= BankrollWeeklySnapshotJob.MAX_ITERATIONS) {
      this.logger.warn(
        `⚠️  Limite de ${BankrollWeeklySnapshotJob.MAX_ITERATIONS} iterações atingido`,
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
    week: number,
    startOfWeek: Date,
    endOfWeek: Date,
  ): Promise<{ created: number; noData: number; errors: number }> {
    const [dailySnapshots, previousSnapshots] = await Promise.all([
      this.prisma.dailySnapshot.findMany({
        where: {
          bankrollId: { in: bankrollIds },
          createdAt: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
        orderBy: { createdAt: 'asc' },
        select: {
          bankrollId: true,
          balance: true,
          unidValue: true,
          dailyProfit: true,
          peakBalance: true,
          maxDrawdown: true,
          betsPlaced: true,
          betsWon: true,
          betsLost: true,
        },
      }),

      // Performance otimizada: DISTINCT ON retorna apenas o último snapshot de cada bankroll
      // Evita buscar milhares de registros antigos desnecessários
      this.prisma.$queryRaw<
        Array<{
          bankrollId: number;
          balance: Decimal;
          unidValue: Decimal;
        }>
      >`
        SELECT DISTINCT ON ("bankrollId")
          "bankrollId",
          "balance",
          "unidValue"
        FROM "snapshots_daily"
        WHERE "bankrollId" IN (${Prisma.join(bankrollIds)})
          AND "createdAt" < ${startOfWeek}
        ORDER BY "bankrollId", "createdAt" DESC
      `,
    ]);

    // Agrupar snapshots diários por bankroll
    const dailyMap = dailySnapshots.reduce<
      Record<number, DailySnapshotAggregateInput[]>
    >((acc, snapshot) => {
      (acc[snapshot.bankrollId] ??= []).push(
        snapshot as DailySnapshotAggregateInput,
      );
      return acc;
    }, {});

    // Mapear snapshots anteriores (DISTINCT ON já retorna apenas um por bankroll)
    const previousMap = new Map(
      previousSnapshots.map((p) => [
        p.bankrollId,
        { balance: p.balance, unidValue: p.unidValue },
      ]),
    );

    const snapshotsToCreate: CreateWeeklySnapshotDTO[] = [];
    let noData = 0;
    let errors = 0;

    for (const bankrollId of bankrollIds) {
      try {
        const daily = dailyMap[bankrollId] ?? [];

        if (daily.length === 0) {
          this.logger.debug(
            `⚠️  Bankroll ${bankrollId}: sem snapshots diários para semana ${week}/${year}`,
          );
          noData++;
          continue;
        }

        const previous = previousMap.get(bankrollId) ?? null;

        const metrics = this.aggregateWeeklyFromDailySnapshots(daily, previous);

        snapshotsToCreate.push({
          bankrollId,
          year,
          week,
          ...metrics,
        });
      } catch (error) {
        this.logger.error(
          `❌ Erro ao agregar snapshot semanal do Bankroll ${bankrollId}:`,
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
   * Agregação pura baseada em DailySnapshot
   */
  private aggregateWeeklyFromDailySnapshots(
    daily: DailySnapshotAggregateInput[],
    previous: PreviousWeeklyBase,
  ) {
    const ZERO = new Decimal(0);

    if (daily.length === 0) {
      throw new Error('Nenhum snapshot diário fornecido');
    }

    // Balance inicial e final
    const balanceStart = previous?.balance ?? daily[0].balance;
    const balanceEnd = daily[daily.length - 1].balance;

    // Unid value inicial e final
    const unidValueStart = previous?.unidValue ?? daily[0].unidValue;
    const unidValueEnd = daily[daily.length - 1].unidValue;

    // Profit semanal
    // const weeklyProfit = balanceEnd.minus(balanceStart);
    const weeklyProfit = daily.reduce(
      (acc, d) => acc.plus(d.dailyProfit),
      ZERO,
    );

    // ROI semanal
    const weeklyROI = balanceStart.isZero()
      ? ZERO
      : weeklyProfit.dividedBy(balanceStart).times(100);

    // Mudança em unidades
    const unitsChange = unidValueStart.isZero()
      ? ZERO
      : balanceEnd
          .dividedBy(unidValueEnd)
          .minus(balanceStart.dividedBy(unidValueStart));

    // Peak balance
    const peakBalance = daily.reduce(
      (max, d) => (d.peakBalance.greaterThan(max) ? d.peakBalance : max),
      balanceStart,
    );

    // Max drawdown
    const maxDrawdown = daily.reduce(
      (max, d) => (d.maxDrawdown.greaterThan(max) ? d.maxDrawdown : max),
      ZERO,
    );

    // Drawdown percentual
    const drawdownPercent = peakBalance.isZero()
      ? ZERO
      : maxDrawdown.dividedBy(peakBalance).times(100);

    // Agregação de apostas
    const betsPlaced = daily.reduce((sum, d) => sum + d.betsPlaced, 0);
    const betsWon = daily.reduce((sum, d) => sum + d.betsWon, 0);
    const betsLost = daily.reduce((sum, d) => sum + d.betsLost, 0);

    // Win rate
    const winRate =
      betsPlaced > 0
        ? new Decimal(betsWon).dividedBy(betsPlaced).times(100)
        : ZERO;

    return {
      balance: balanceEnd,
      unidValue: unidValueEnd,
      weeklyProfit,
      weeklyROI,
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

  /**
   * Calcula a semana ISO 8601 (segunda-feira como início)
   */
  private getISOWeek(date: Date): { year: number; week: number } {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);

    const firstThursday = target.valueOf();
    target.setMonth(0, 1);

    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }

    const week = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);

    return { year: target.getFullYear(), week };
  }

  /**
   * Calcula os limites (início e fim) da semana ISO
   */
  private getWeekBounds(
    year: number,
    week: number,
  ): { startOfWeek: Date; endOfWeek: Date } {
    const jan4 = new Date(year, 0, 4);
    const dayOfWeek = (jan4.getDay() + 6) % 7;

    const weekStart = new Date(jan4);
    weekStart.setDate(jan4.getDate() - dayOfWeek + (week - 1) * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return { startOfWeek: weekStart, endOfWeek: weekEnd };
  }

  /**
   * Formata data para log (DD/MM/YYYY)
   */
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
