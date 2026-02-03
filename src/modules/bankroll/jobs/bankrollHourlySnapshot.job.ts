import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { Decimal, PrismaService } from 'src/libs/database';
import { BankrollHourlySnapshotService } from '../snapshots/services/bankrollHourlySnapshot.service';
import { CreateHourlySnapshotDTO } from '../snapshots/dto/hourlySnapshot.dto';
import {
  PreviousHistoryData,
  PreviousSnapshotRow,
  DecimalLike,
} from '../snapshots/types/bankrollHourly.types';
import { BankrollHistoryDTO } from '../z.dto/history/bankrollHistory.dto';

@Injectable()
export class BankrollHourlySnapshotJob {
  private readonly logger = new Logger(BankrollHourlySnapshotJob.name);
  private static readonly BATCH_SIZE = 500;

  /**
   * Backfill leve: tenta gerar hora anterior + mais 1 hora atrás (total 2 buckets).
   * Se quiser “1–2 horas atrás”, deixe 2.
   */
  private static readonly LOOKBACK_HOURS = 2;

  constructor(
    private readonly prisma: PrismaService,
    private readonly snapshotService: BankrollHourlySnapshotService,
  ) {}

  /**
   * Roda no minuto 05 de toda hora (HH:05).
   * Cron do Nest usa 6 campos: second minute hour day month dayOfWeek
   */
  @Cron('0 7 * * * *', {
    name: 'hourly-bankroll-snapshot',
    timeZone: 'America/Sao_Paulo',
  })
  async handleHourlySnapshot(): Promise<void> {
    this.logger.log(
      '🕐 Iniciando geração de snapshots horários (batch + backfill)...',
    );

    // end = início da hora atual
    const endBase = new Date();
    endBase.setMinutes(0, 0, 0);

    // Processa buckets: 1h atrás, 2h atrás, ...
    for (
      let offset = 1;
      offset <= BankrollHourlySnapshotJob.LOOKBACK_HOURS;
      offset++
    ) {
      const end = new Date(endBase);
      end.setHours(end.getHours() - (offset - 1));

      const start = new Date(end);
      start.setHours(start.getHours() - 1);

      const bucketStart = start;

      await this.processBucket(bucketStart, start, end);
    }
  }

  private async processBucket(
    bucketStart: Date,
    start: Date,
    end: Date,
  ): Promise<void> {
    this.logger.log(
      `🧱 Processando bucket: ${bucketStart.toISOString()}  [${start.toISOString()} -> ${end.toISOString()})`,
    );

    try {
      // bankrollIds que já possuem snapshot nesse bucketStart
      const existingSnapshots = await this.prisma.hourlySnapshot.findMany({
        where: { bucketStart },
        select: { bankrollId: true },
      });
      const existingIds = new Set(existingSnapshots.map((s) => s.bankrollId));

      let skip = 0;
      let totalCreated = 0;
      let totalSkippedEqualPrev = 0;

      while (true) {
        const bankrolls = await this.prisma.bankroll.findMany({
          skip,
          take: BankrollHourlySnapshotJob.BATCH_SIZE,
        });

        if (bankrolls.length === 0) break;

        const bankrollIds = bankrolls
          .map((b) => b.id)
          .filter((id) => !existingIds.has(id));

        if (bankrollIds.length === 0) {
          skip += BankrollHourlySnapshotJob.BATCH_SIZE;
          continue;
        }

        const [hourlyHistories, previousHistories, previousSnapshots] =
          await Promise.all([
            // Histories do bucket
            this.prisma.bankrollHistory.findMany({
              where: {
                bankrollId: { in: bankrollIds },
                date: { gte: start, lt: end },
              },
              orderBy: { date: 'asc' },
            }),

            // Último history antes do bucket (pra ter start balance/unid)
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
              AND "date" < ${start}
            ORDER BY "bankrollId", "date" DESC
          `,

            // Último snapshot antes do bucket (pra comparar e pular se igual)
            this.prisma.$queryRaw<
              Array<{
                bankrollId: number;
                balance: Decimal;
                unidValue: Decimal;
                hourlyProfit: Decimal;
                hourlyROI: Decimal;
                unitsChange: Decimal;
                peakBalance: Decimal;
                maxDrawdown: Decimal;
                hourlyDrawdown: Decimal;
                drawdownPercent: Decimal;
                betsPlaced: number;
                betsWon: number;
                betsLost: number;
                winRate: Decimal;
              }>
            >`
            SELECT DISTINCT ON ("bankrollId")
              "bankrollId",
              "balance",
              "unidValue",
              "hourlyProfit",
              "hourlyROI",
              "unitsChange",
              "peakBalance",
              "maxDrawdown",
              "hourlyDrawdown",
              "drawdownPercent",
              "betsPlaced",
              "betsWon",
              "betsLost",
              "winRate"
            FROM "snapshots_hourly"
            WHERE "bankrollId" IN (${Prisma.join(bankrollIds)})
              AND "bucketStart" < ${bucketStart}
            ORDER BY "bankrollId", "bucketStart" DESC
          `,
          ]);

        const historyMap = hourlyHistories.reduce<
          Record<number, BankrollHistoryDTO[]>
        >((acc, curr) => {
          (acc[curr.bankrollId] ??= []).push(curr);
          return acc;
        }, {});

        const previousHistoryMap = new Map(
          previousHistories.map((p) => [p.bankrollId, p]),
        );
        const previousSnapshotMap = new Map(
          previousSnapshots.map((p) => [p.bankrollId, p]),
        );

        const snapshotsToCreate: CreateHourlySnapshotDTO[] = [];

        for (const bankroll of bankrolls) {
          if (!bankrollIds.includes(bankroll.id)) continue;

          try {
            const hourly = historyMap[bankroll.id] ?? [];
            const prevHistory = (previousHistoryMap.get(bankroll.id) ??
              null) as PreviousHistoryData;
            const prevSnapshot = (previousSnapshotMap.get(bankroll.id) ??
              null) as PreviousSnapshotRow;

            const metrics = this.calculateMetricsInMemory(hourly, prevHistory);

            // ✅ Skip se for exatamente igual ao snapshot anterior
            if (prevSnapshot && this.isEqualToPrevious(metrics, prevSnapshot)) {
              totalSkippedEqualPrev++;
              continue;
            }

            snapshotsToCreate.push({
              bankrollId: bankroll.id,
              bucketStart,
              ...metrics,
            });
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

        skip += BankrollHourlySnapshotJob.BATCH_SIZE;
      }

      this.logger.log(
        `✅ Bucket concluído (${bucketStart.toISOString()}): ${totalCreated} criados | ${totalSkippedEqualPrev} pulados (iguais ao anterior).`,
      );
    } catch (error) {
      this.logger.error(
        `💥 Erro fatal no bucket ${bucketStart.toISOString()}:`,
        error,
      );
    }
  }

  private isEqualToPrevious(
    curr: Omit<CreateHourlySnapshotDTO, 'bankrollId' | 'bucketStart'>,
    prev: NonNullable<PreviousSnapshotRow>,
  ): boolean {
    const toDecimal = (v: DecimalLike): Decimal =>
      v instanceof Decimal ? v : new Decimal(v);

    return (
      toDecimal(curr.balance).equals(prev.balance) &&
      toDecimal(curr.unidValue).equals(prev.unidValue) &&
      toDecimal(curr.hourlyProfit).equals(prev.hourlyProfit) &&
      toDecimal(curr.hourlyROI).equals(prev.hourlyROI) &&
      toDecimal(curr.unitsChange).equals(prev.unitsChange) &&
      toDecimal(curr.peakBalance).equals(prev.peakBalance) &&
      toDecimal(curr.maxDrawdown).equals(prev.maxDrawdown) &&
      toDecimal(curr.hourlyDrawdown).equals(prev.hourlyDrawdown) &&
      toDecimal(curr.drawdownPercent).equals(prev.drawdownPercent) &&
      curr.betsPlaced === prev.betsPlaced &&
      curr.betsWon === prev.betsWon &&
      curr.betsLost === prev.betsLost &&
      toDecimal(curr.winRate).equals(prev.winRate)
    );
  }

  private calculateMetricsInMemory(
    hourlyHistories: BankrollHistoryDTO[],
    previousHistory: PreviousHistoryData,
  ) {
    const ZERO = new Decimal(0);

    const balanceStart = previousHistory?.balanceAfter ?? ZERO;
    const balanceEnd = hourlyHistories.at(-1)?.balanceAfter ?? balanceStart;

    const unidValueStart = previousHistory?.unidValueAfter ?? ZERO;
    const unidValueEnd =
      hourlyHistories.at(-1)?.unidValueAfter ?? unidValueStart;

    // const hourlyProfit = balanceEnd.minus(balanceStart);

    // const hourlyROI = balanceStart.isZero()
    //   ? ZERO
    //   : hourlyProfit.dividedBy(balanceStart).times(100);

    // ✅ Lucro = soma dos amounts apenas de tipos relacionados a apostas
    const BET_TYPES = [
      'BET_PLACED',
      'BET_WIN',
      'BET_LOSS',
      'BET_VOID',
    ] as const;

    const hourlyProfit = hourlyHistories
      .filter((h) => BET_TYPES.includes(h.type as (typeof BET_TYPES)[number]))
      .reduce((acc, h) => acc.plus(h.amount), ZERO);

    // ✅ ROI calculado sobre o balanceStart, mas baseado no lucro real
    const hourlyROI = balanceStart.isZero()
      ? ZERO
      : hourlyProfit.dividedBy(balanceStart).times(100);

    const unitsChange = unidValueStart.isZero()
      ? ZERO
      : balanceEnd
          .dividedBy(unidValueEnd)
          .minus(balanceStart.dividedBy(unidValueStart));

    let peakBalance = balanceStart;
    let maxDrawdown = ZERO;

    for (const h of hourlyHistories) {
      if (h.balanceAfter.greaterThan(peakBalance)) {
        peakBalance = h.balanceAfter;
      }

      const drawdown = peakBalance.minus(h.balanceAfter);
      if (drawdown.greaterThan(maxDrawdown)) {
        maxDrawdown = drawdown;
      }
    }

    const hourlyDrawdown = peakBalance.minus(balanceEnd);

    const drawdownPercent = peakBalance.isZero()
      ? ZERO
      : hourlyDrawdown.dividedBy(peakBalance).times(100);

    const betsPlaced = hourlyHistories.filter(
      (h) => h.type === 'BET_PLACED',
    ).length;
    const betsWon = hourlyHistories.filter((h) => h.type === 'BET_WIN').length;
    const betsLost = hourlyHistories.filter(
      (h) => h.type === 'BET_LOSS',
    ).length;

    const winRate =
      betsPlaced > 0
        ? new Decimal(betsWon).dividedBy(betsPlaced).times(100)
        : ZERO;

    return {
      balance: balanceEnd,
      unidValue: unidValueEnd,
      hourlyProfit,
      hourlyROI,
      unitsChange,
      peakBalance,
      maxDrawdown,
      hourlyDrawdown,
      drawdownPercent,
      betsPlaced,
      betsWon,
      betsLost,
      winRate,
    };
  }
}
