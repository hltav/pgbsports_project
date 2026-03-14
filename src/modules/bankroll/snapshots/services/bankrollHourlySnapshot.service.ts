// import {
//   Injectable,
//   NotFoundException,
//   ForbiddenException,
//   ConflictException,
// } from '@nestjs/common';
// import { PrismaService, Decimal } from './../../../../libs/database';
// import {
//   CreateHourlySnapshotDTO,
//   GetHourlySnapshotDTO,
// } from '../dto/hourlySnapshot.dto';
// import { Prisma } from '@prisma/client';

// @Injectable()
// export class BankrollHourlySnapshotService {
//   constructor(private readonly prisma: PrismaService) {}

//   // HELPERS
//   private async validateBankrollOwnership(
//     bankrollId: number,
//     userId: number,
//   ): Promise<void> {
//     const bankroll = await this.prisma.bankroll.findUnique({
//       where: { id: bankrollId },
//     });

//     if (!bankroll) {
//       throw new NotFoundException(`Bankroll ${bankrollId} não encontrado`);
//     }

//     if (bankroll.userId !== userId) {
//       throw new ForbiddenException('Acesso negado a este bankroll');
//     }
//   }

//   private async findSnapshotOrFail(
//     snapshotId: number,
//     userId: number,
//   ): Promise<GetHourlySnapshotDTO> {
//     const snapshot = await this.prisma.hourlySnapshot.findUnique({
//       where: { id: snapshotId },
//       include: { bankroll: true },
//     });

//     if (!snapshot) {
//       throw new NotFoundException(`Snapshot ${snapshotId} não encontrado`);
//     }

//     if (snapshot.bankroll.userId !== userId) {
//       throw new ForbiddenException('Acesso negado a este snapshot');
//     }

//     return snapshot as unknown as GetHourlySnapshotDTO;
//   }

//   // CREATE
//   async createSnapshot(
//     data: CreateHourlySnapshotDTO,
//     userId: number,
//   ): Promise<GetHourlySnapshotDTO> {
//     await this.validateBankrollOwnership(data.bankrollId, userId);

//     const existing = await this.prisma.hourlySnapshot.findUnique({
//       where: {
//         bankrollId_bucketStart: {
//           bankrollId: data.bankrollId,
//           bucketStart: data.bucketStart,
//         },
//       },
//     });

//     if (existing) {
//       throw new ConflictException(
//         `Snapshot para ${data.bucketStart.toISOString()} já existe`,
//       );
//     }

//     const snapshot = await this.prisma.$transaction(async (tx) => {
//       const created = await tx.hourlySnapshot.create({
//         data: {
//           bankrollId: data.bankrollId,
//           bucketStart: data.bucketStart,
//           balance: new Decimal(data.balance),
//           unidValue: new Decimal(data.unidValue),
//           hourlyProfit: new Decimal(data.hourlyProfit),
//           hourlyROI: new Decimal(data.hourlyROI),
//           unitsChange: new Decimal(data.unitsChange),
//           cumulativeUnits: new Decimal(0), // temporário
//           peakBalance: new Decimal(data.peakBalance),
//           maxDrawdown: new Decimal(data.maxDrawdown),
//           hourlyDrawdown: new Decimal(data.hourlyDrawdown),
//           drawdownPercent: new Decimal(data.drawdownPercent),
//           betsPlaced: data.betsPlaced,
//           betsWon: data.betsWon,
//           betsLost: data.betsLost,
//           winRate: new Decimal(data.winRate),
//         },
//       });

//       await this.recalculateCumulativeUnitsFrom(
//         data.bankrollId,
//         data.bucketStart,
//         tx,
//       );

//       return created;
//     });

//     return snapshot as unknown as GetHourlySnapshotDTO;
//   }

//   async createManySnapshots(
//     snapshots: CreateHourlySnapshotDTO[],
//   ): Promise<number> {
//     if (snapshots.length === 0) return 0;

//     const ordered = [...snapshots].sort((a, b) => {
//       if (a.bankrollId !== b.bankrollId) return a.bankrollId - b.bankrollId;
//       return a.bucketStart.getTime() - b.bucketStart.getTime();
//     });

//     let count = 0;

//     await this.prisma.$transaction(async (tx) => {
//       const earliestByBankroll = new Map<number, Date>();

//       for (const data of ordered) {
//         const currentEarliest = earliestByBankroll.get(data.bankrollId);

//         if (
//           !currentEarliest ||
//           data.bucketStart.getTime() < currentEarliest.getTime()
//         ) {
//           earliestByBankroll.set(data.bankrollId, data.bucketStart);
//         }

//         await tx.hourlySnapshot.upsert({
//           where: {
//             bankrollId_bucketStart: {
//               bankrollId: data.bankrollId,
//               bucketStart: data.bucketStart,
//             },
//           },
//           update: {
//             balance: new Decimal(data.balance),
//             unidValue: new Decimal(data.unidValue),
//             hourlyProfit: new Decimal(data.hourlyProfit),
//             hourlyROI: new Decimal(data.hourlyROI),
//             unitsChange: new Decimal(data.unitsChange),
//             peakBalance: new Decimal(data.peakBalance),
//             maxDrawdown: new Decimal(data.maxDrawdown),
//             hourlyDrawdown: new Decimal(data.hourlyDrawdown),
//             drawdownPercent: new Decimal(data.drawdownPercent),
//             betsPlaced: data.betsPlaced,
//             betsWon: data.betsWon,
//             betsLost: data.betsLost,
//             winRate: new Decimal(data.winRate),
//           },
//           create: {
//             bankrollId: data.bankrollId,
//             bucketStart: data.bucketStart,
//             balance: new Decimal(data.balance),
//             unidValue: new Decimal(data.unidValue),
//             hourlyProfit: new Decimal(data.hourlyProfit),
//             hourlyROI: new Decimal(data.hourlyROI),
//             unitsChange: new Decimal(data.unitsChange),
//             cumulativeUnits: new Decimal(0), // temporário
//             peakBalance: new Decimal(data.peakBalance),
//             maxDrawdown: new Decimal(data.maxDrawdown),
//             hourlyDrawdown: new Decimal(data.hourlyDrawdown),
//             drawdownPercent: new Decimal(data.drawdownPercent),
//             betsPlaced: data.betsPlaced,
//             betsWon: data.betsWon,
//             betsLost: data.betsLost,
//             winRate: new Decimal(data.winRate),
//           },
//         });

//         count++;
//       }

//       for (const [
//         bankrollId,
//         fromBucketStart,
//       ] of earliestByBankroll.entries()) {
//         await this.recalculateCumulativeUnitsFrom(
//           bankrollId,
//           fromBucketStart,
//           tx,
//         );
//       }
//     });

//     return count;
//   }

//   // READ
//   async getSnapshotsByBankroll(
//     bankrollId: number,
//     userId: number,
//   ): Promise<GetHourlySnapshotDTO[]> {
//     await this.validateBankrollOwnership(bankrollId, userId);

//     const snapshots = await this.prisma.hourlySnapshot.findMany({
//       where: { bankrollId },
//       orderBy: { bucketStart: 'desc' },
//     });

//     return snapshots as unknown as GetHourlySnapshotDTO[];
//   }

//   async getSnapshotByBucketStart(
//     bankrollId: number,
//     bucketStart: Date,
//     userId: number,
//   ): Promise<GetHourlySnapshotDTO> {
//     await this.validateBankrollOwnership(bankrollId, userId);

//     const snapshot = await this.prisma.hourlySnapshot.findUnique({
//       where: {
//         bankrollId_bucketStart: {
//           bankrollId,
//           bucketStart,
//         },
//       },
//     });

//     if (!snapshot) {
//       throw new NotFoundException(
//         `Snapshot para ${bucketStart.toISOString()} não encontrado`,
//       );
//     }

//     return snapshot as unknown as GetHourlySnapshotDTO;
//   }

//   async getSnapshotById(
//     snapshotId: number,
//     userId: number,
//   ): Promise<GetHourlySnapshotDTO> {
//     return this.findSnapshotOrFail(snapshotId, userId);
//   }

//   async getLatestSnapshot(
//     bankrollId: number,
//     userId: number,
//   ): Promise<GetHourlySnapshotDTO | null> {
//     await this.validateBankrollOwnership(bankrollId, userId);

//     const snapshot = await this.prisma.hourlySnapshot.findFirst({
//       where: { bankrollId },
//       orderBy: { bucketStart: 'desc' },
//     });

//     return snapshot as unknown as GetHourlySnapshotDTO | null;
//   }

//   async getSnapshotsByDateRange(
//     bankrollId: number,
//     startDate: Date,
//     endDate: Date,
//     userId: number,
//   ): Promise<GetHourlySnapshotDTO[]> {
//     await this.validateBankrollOwnership(bankrollId, userId);

//     const snapshots = await this.prisma.hourlySnapshot.findMany({
//       where: {
//         bankrollId,
//         bucketStart: {
//           gte: startDate,
//           lt: endDate,
//         },
//       },
//       orderBy: { bucketStart: 'desc' },
//     });

//     return snapshots as unknown as GetHourlySnapshotDTO[];
//   }

//   // UPDATE
//   async updateSnapshot(
//     snapshotId: number,
//     data: Partial<CreateHourlySnapshotDTO>,
//     userId: number,
//   ): Promise<GetHourlySnapshotDTO> {
//     const current = await this.findSnapshotOrFail(snapshotId, userId);

//     const originalBucketStart = current.bucketStart;
//     const nextBucketStart = data.bucketStart ?? current.bucketStart;

//     const updateData: Prisma.HourlySnapshotUpdateInput = {};

//     if (data.bucketStart !== undefined) {
//       updateData.bucketStart = data.bucketStart;
//     }

//     if (data.balance !== undefined)
//       updateData.balance = new Decimal(data.balance);
//     if (data.unidValue !== undefined)
//       updateData.unidValue = new Decimal(data.unidValue);
//     if (data.hourlyProfit !== undefined)
//       updateData.hourlyProfit = new Decimal(data.hourlyProfit);
//     if (data.hourlyROI !== undefined)
//       updateData.hourlyROI = new Decimal(data.hourlyROI);
//     if (data.unitsChange !== undefined)
//       updateData.unitsChange = new Decimal(data.unitsChange);
//     if (data.peakBalance !== undefined)
//       updateData.peakBalance = new Decimal(data.peakBalance);
//     if (data.maxDrawdown !== undefined)
//       updateData.maxDrawdown = new Decimal(data.maxDrawdown);
//     if (data.hourlyDrawdown !== undefined)
//       updateData.hourlyDrawdown = new Decimal(data.hourlyDrawdown);
//     if (data.drawdownPercent !== undefined)
//       updateData.drawdownPercent = new Decimal(data.drawdownPercent);

//     if (data.betsPlaced !== undefined) updateData.betsPlaced = data.betsPlaced;
//     if (data.betsWon !== undefined) updateData.betsWon = data.betsWon;
//     if (data.betsLost !== undefined) updateData.betsLost = data.betsLost;
//     if (data.winRate !== undefined)
//       updateData.winRate = new Decimal(data.winRate);

//     const recalcFrom =
//       originalBucketStart < nextBucketStart
//         ? originalBucketStart
//         : nextBucketStart;

//     const updated = await this.prisma.$transaction(async (tx) => {
//       const result = await tx.hourlySnapshot.update({
//         where: { id: snapshotId },
//         data: updateData,
//       });

//       await this.recalculateCumulativeUnitsFrom(
//         current.bankrollId,
//         recalcFrom,
//         tx,
//       );

//       return result;
//     });

//     return updated as unknown as GetHourlySnapshotDTO;
//   }
//   // DELETE
//   async deleteSnapshot(snapshotId: number, userId: number): Promise<void> {
//     const snapshot = await this.findSnapshotOrFail(snapshotId, userId);

//     await this.prisma.$transaction(async (tx) => {
//       await tx.hourlySnapshot.delete({
//         where: { id: snapshotId },
//       });

//       await this.recalculateCumulativeUnitsFrom(
//         snapshot.bankrollId,
//         snapshot.bucketStart,
//         tx,
//       );
//     });
//   }

//   async deleteSnapshotsByDateRange(
//     bankrollId: number,
//     startDate: Date,
//     endDate: Date,
//     userId: number,
//   ): Promise<number> {
//     await this.validateBankrollOwnership(bankrollId, userId);

//     const result = await this.prisma.$transaction(async (tx) => {
//       const deleted = await tx.hourlySnapshot.deleteMany({
//         where: {
//           bankrollId,
//           bucketStart: {
//             gte: startDate,
//             lt: endDate,
//           },
//         },
//       });

//       await this.recalculateCumulativeUnitsFrom(bankrollId, startDate, tx);

//       return deleted;
//     });

//     return result.count;
//   }

//   private async recalculateCumulativeUnitsFrom(
//     bankrollId: number,
//     fromBucketStart: Date,
//     tx: Prisma.TransactionClient = this.prisma,
//   ): Promise<void> {
//     const previous = await tx.hourlySnapshot.findFirst({
//       where: {
//         bankrollId,
//         bucketStart: { lt: fromBucketStart },
//       },
//       orderBy: { bucketStart: 'desc' },
//     });

//     let runningCumulative = new Decimal(previous?.cumulativeUnits ?? 0);

//     const snapshotsToRecalculate = await tx.hourlySnapshot.findMany({
//       where: {
//         bankrollId,
//         bucketStart: { gte: fromBucketStart },
//       },
//       orderBy: { bucketStart: 'asc' },
//     });

//     for (const snapshot of snapshotsToRecalculate) {
//       runningCumulative = runningCumulative.plus(
//         new Decimal(snapshot.unitsChange ?? 0),
//       );

//       await tx.hourlySnapshot.update({
//         where: { id: snapshot.id },
//         data: {
//           cumulativeUnits: runningCumulative,
//         },
//       });
//     }
//   }

//   async rebuildCumulativeUnits(bankrollId: number): Promise<void> {
//     const snapshots = await this.prisma.hourlySnapshot.findMany({
//       where: { bankrollId },
//       orderBy: { bucketStart: 'asc' },
//     });

//     let running = new Decimal(0);

//     await this.prisma.$transaction(async (tx) => {
//       for (const snapshot of snapshots) {
//         running = running.plus(new Decimal(snapshot.unitsChange ?? 0));

//         await tx.hourlySnapshot.update({
//           where: { id: snapshot.id },
//           data: {
//             cumulativeUnits: running,
//           },
//         });
//       }
//     });
//   }
// }

import { Injectable } from '@nestjs/common';
import { PrismaService, Decimal } from './../../../../libs/database';
import {
  CreateHourlySnapshotDTO,
  GetHourlySnapshotDTO,
} from '../dto/hourlySnapshot.dto';
import { Prisma } from '@prisma/client';
import {
  DecimalLike,
  PreviousHistoryData,
  PreviousSnapshotRow,
} from '../types/bankrollHourly.types';
import { BankrollHistoryDTO } from '../../z.dto/history/bankrollHistory.dto';

@Injectable()
export class BankrollHourlySnapshotService {
  constructor(private readonly prisma: PrismaService) {}

  async createManySnapshots(
    inputs: CreateHourlySnapshotDTO[],
  ): Promise<number> {
    if (inputs.length === 0) return 0;

    const bankrollIds = [...new Set(inputs.map((i) => i.bankrollId))];

    // Busca o último snapshot com cumulativeUnits não-nulo para cada bankroll
    const latestSnapshots = await this.prisma.hourlySnapshot.findMany({
      where: {
        bankrollId: { in: bankrollIds },
        cumulativeUnits: { not: null }, // ← ignora os nulos
      },
      orderBy: { bucketStart: 'desc' },
      distinct: ['bankrollId'],
      select: { bankrollId: true, cumulativeUnits: true },
    });

    const cumulativeMap = new Map(
      latestSnapshots.map((s) => [
        s.bankrollId,
        new Decimal(s.cumulativeUnits!.toString()),
      ]),
    );

    // Para bankrolls sem nenhum cumulativeUnits salvo, soma todo o histórico existente
    const bankrollsWithoutCumulative = bankrollIds.filter(
      (id) => !cumulativeMap.has(id),
    );

    if (bankrollsWithoutCumulative.length > 0) {
      // Busca o menor bucketStart de cada bankroll nos inputs atuais
      const minBucketByBankroll = new Map<number, Date>();
      for (const input of inputs) {
        if (!bankrollsWithoutCumulative.includes(input.bankrollId)) continue;
        const current = minBucketByBankroll.get(input.bankrollId);
        if (!current || input.bucketStart < current) {
          minBucketByBankroll.set(input.bankrollId, input.bucketStart);
        }
      }

      // Busca a soma histórica de cada bankroll individualmente (antes do seu próprio bucket)
      const historicalSums = await Promise.all(
        Array.from(minBucketByBankroll.entries()).map(
          ([bankrollId, minBucket]) =>
            this.prisma.hourlySnapshot
              .aggregate({
                where: {
                  bankrollId,
                  bucketStart: { lt: minBucket },
                },
                _sum: { unitsChange: true },
              })
              .then((result) => ({
                bankrollId,
                sum: new Decimal(result._sum.unitsChange?.toString() ?? '0'),
              })),
        ),
      );

      for (const { bankrollId, sum } of historicalSums) {
        cumulativeMap.set(bankrollId, sum);
      }
    }

    // Ordena por bucketStart para acumular corretamente dentro do batch
    const sorted = [...inputs].sort(
      (a, b) => a.bucketStart.getTime() - b.bucketStart.getTime(),
    );

    const data = sorted.map((input) => {
      const prev = cumulativeMap.get(input.bankrollId) ?? new Decimal(0);
      const cumulative = prev.plus(new Decimal(input.unitsChange.toString()));
      cumulativeMap.set(input.bankrollId, cumulative);

      return {
        ...input,
        balance: new Decimal(input.balance.toString()),
        unidValue: new Decimal(input.unidValue.toString()),
        hourlyProfit: new Decimal(input.hourlyProfit.toString()),
        hourlyROI: new Decimal(input.hourlyROI.toString()),
        unitsChange: new Decimal(input.unitsChange.toString()),
        peakBalance: new Decimal(input.peakBalance.toString()),
        maxDrawdown: new Decimal(input.maxDrawdown.toString()),
        hourlyDrawdown: new Decimal(input.hourlyDrawdown.toString()),
        drawdownPercent: new Decimal(input.drawdownPercent.toString()),
        winRate: new Decimal(input.winRate.toString()),
        cumulativeUnits: cumulative,
      };
    });

    await this.prisma.hourlySnapshot.createMany({ data, skipDuplicates: true });
    return data.length;
  }

  async findAll(bankrollId: number): Promise<GetHourlySnapshotDTO[]> {
    const snapshots = await this.prisma.hourlySnapshot.findMany({
      where: { bankrollId },
      orderBy: { bucketStart: 'asc' },
    });

    return snapshots.map(({ cumulativeUnits, ...rest }) => ({
      ...rest,
      cumulativeUnits: cumulativeUnits ?? undefined,
    }));
  }

  async upsertSnapshot(input: CreateHourlySnapshotDTO): Promise<void> {
    const { bankrollId, bucketStart, unitsChange } = input;

    const previous = await this.prisma.hourlySnapshot.findFirst({
      where: {
        bankrollId,
        bucketStart: { lt: bucketStart },
      },
      orderBy: { bucketStart: 'desc' },
      select: { cumulativeUnits: true, bucketStart: true },
    });

    const prevCumulative = previous?.cumulativeUnits
      ? new Decimal(previous.cumulativeUnits.toString())
      : new Decimal(0);

    const cumulativeUnits = prevCumulative.plus(unitsChange);

    await this.prisma.hourlySnapshot.upsert({
      where: {
        bankrollId_bucketStart: { bankrollId, bucketStart },
      },
      create: {
        ...input,
        cumulativeUnits,
      },
      update: {
        ...input,
        cumulativeUnits,
      },
    });

    await this.recalculateCumulativeUnitsFrom(bankrollId, bucketStart);
  }

  async fetchBucketContext(
    bankrollIds: number[],
    bucketStart: Date,
    start: Date,
  ): Promise<{
    previousHistoryMap: Map<number, PreviousHistoryData>;
    previousSnapshotMap: Map<number, PreviousSnapshotRow>;
  }> {
    const [previousHistories, previousSnapshots] = await Promise.all([
      this.prisma.$queryRaw<
        Array<PreviousHistoryData & { bankrollId: number }>
      >`
      SELECT DISTINCT ON ("bankrollId")
        "bankrollId", "balanceAfter", "unidValueAfter"
      FROM "bankroll_histories"
      WHERE "bankrollId" IN (${Prisma.join(bankrollIds)})
        AND "date" < ${start}
      ORDER BY "bankrollId", "date" DESC, "id" DESC
    `,
      this.prisma.$queryRaw<
        Array<PreviousSnapshotRow & { bankrollId: number }>
      >`
  SELECT DISTINCT ON ("bankrollId")
    "bankrollId", "balance", "unidValue", "hourlyProfit", "hourlyROI",
    "unitsChange", "peakBalance", "maxDrawdown", "hourlyDrawdown",
    "drawdownPercent", "betsPlaced", "betsWon", "betsLost", "winRate",
    "cumulativeUnits"   -- ← adicionar aqui
  FROM "snapshots_hourly"
  WHERE "bankrollId" IN (${Prisma.join(bankrollIds)})
    AND "bucketStart" < ${bucketStart}
  ORDER BY "bankrollId", "bucketStart" DESC
`,
    ]);

    return {
      previousHistoryMap: new Map(
        previousHistories.map((p) => [p.bankrollId, p]),
      ),
      previousSnapshotMap: new Map(
        previousSnapshots.map((p) => [p.bankrollId, p]),
      ),
    };
  }

  async recalculateCumulativeUnitsFrom(
    bankrollId: number,
    fromBucket: Date,
  ): Promise<void> {
    const anchor = await this.prisma.hourlySnapshot.findUnique({
      where: {
        bankrollId_bucketStart: { bankrollId, bucketStart: fromBucket },
      },
      select: { cumulativeUnits: true },
    });

    if (!anchor) return;

    const subsequent = await this.prisma.hourlySnapshot.findMany({
      where: {
        bankrollId,
        bucketStart: { gt: fromBucket },
      },
      orderBy: { bucketStart: 'asc' },
      select: { id: true, unitsChange: true, bucketStart: true },
    });

    if (subsequent.length === 0) return;

    let running = new Decimal(anchor.cumulativeUnits?.toString() ?? '0');

    const updates = subsequent.map((snap) => {
      running = running.plus(snap.unitsChange.toString());
      return {
        id: snap.id,
        cumulativeUnits: running,
      };
    });

    await this.prisma.$transaction(
      updates.map(({ id, cumulativeUnits }) =>
        this.prisma.hourlySnapshot.update({
          where: { id },
          data: { cumulativeUnits },
        }),
      ),
    );
  }

  async recalculateAll(bankrollId: number): Promise<void> {
    const snapshots = await this.prisma.hourlySnapshot.findMany({
      where: { bankrollId },
      orderBy: { bucketStart: 'asc' },
      select: { id: true, unitsChange: true },
    });

    let running = new Decimal(0);

    const updates = snapshots.map((snap) => {
      running = running.plus(snap.unitsChange.toString());
      return {
        id: snap.id,
        cumulativeUnits: running,
      };
    });

    await this.prisma.$transaction(
      updates.map(({ id, cumulativeUnits }) =>
        this.prisma.hourlySnapshot.update({
          where: { id },
          data: { cumulativeUnits },
        }),
      ),
    );
  }

  async getCurrentCumulativeUnits(bankrollId: number): Promise<Decimal> {
    const latest = await this.prisma.hourlySnapshot.findFirst({
      where: { bankrollId },
      orderBy: { bucketStart: 'desc' },
      select: { cumulativeUnits: true },
    });

    return latest?.cumulativeUnits
      ? new Decimal(latest.cumulativeUnits.toString())
      : new Decimal(0);
  }

  public calculateMetrics(
    hourlyHistories: BankrollHistoryDTO[],
    previousHistory: PreviousHistoryData,
  ) {
    const ZERO = new Decimal(0);

    const balanceStart = previousHistory?.balanceAfter ?? ZERO;
    const balanceEnd = hourlyHistories.at(-1)?.balanceAfter ?? balanceStart;

    const unidValueStart = previousHistory?.unidValueAfter ?? ZERO;
    const unidValueEnd =
      hourlyHistories.at(-1)?.unidValueAfter ?? unidValueStart;

    const BET_TYPES = [
      'BET_PLACED',
      'BET_WIN',
      'BET_LOSS',
      'BET_VOID',
    ] as const;

    const hourlyProfit = hourlyHistories
      .filter((h) => BET_TYPES.includes(h.type as (typeof BET_TYPES)[number]))
      .reduce((acc, h) => acc.plus(h.amount), ZERO);

    const hourlyROI = balanceStart.isZero()
      ? ZERO
      : hourlyProfit.dividedBy(balanceStart).times(100);

    const unitsChange =
      unidValueStart.isZero() || unidValueEnd.isZero()
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

  public isEqualToPrevious(
    curr: Omit<CreateHourlySnapshotDTO, 'bankrollId' | 'bucketStart'>,
    prev: NonNullable<PreviousSnapshotRow>,
  ): boolean {
    // Se o snapshot anterior ainda não tem cumulativeUnits calculado,
    // nunca pular — precisa ser criado para registrar o cumulative
    if (prev.cumulativeUnits === null || prev.cumulativeUnits === undefined) {
      return false;
    }

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
}

// @Injectable()
// export class BankrollHourlySnapshotService {
//   constructor(private readonly prisma: PrismaService) {}

//   private async validateBankrollOwnership(
//     bankrollId: number,
//     userId: number,
//   ): Promise<void> {
//     const bankroll = await this.prisma.bankroll.findUnique({
//       where: { id: bankrollId },
//     });

//     if (!bankroll) {
//       throw new NotFoundException(`Bankroll ${bankrollId} não encontrado`);
//     }

//     if (bankroll.userId !== userId) {
//       throw new ForbiddenException('Acesso negado a este bankroll');
//     }
//   }

//   private async findSnapshotOrFail(
//     snapshotId: number,
//     userId: number,
//   ): Promise<GetHourlySnapshotDTO> {
//     const snapshot = await this.prisma.hourlySnapshot.findUnique({
//       where: { id: snapshotId },
//       include: { bankroll: true },
//     });

//     if (!snapshot) {
//       throw new NotFoundException(`Snapshot ${snapshotId} não encontrado`);
//     }

//     if (snapshot.bankroll.userId !== userId) {
//       throw new ForbiddenException('Acesso negado a este snapshot');
//     }

//     return snapshot as unknown as GetHourlySnapshotDTO;
//   }

//   async createSnapshot(
//     data: CreateHourlySnapshotDTO,
//     userId: number,
//   ): Promise<GetHourlySnapshotDTO> {
//     await this.validateBankrollOwnership(data.bankrollId, userId);

//     const existing = await this.prisma.hourlySnapshot.findUnique({
//       where: {
//         bankrollId_bucketStart: {
//           bankrollId: data.bankrollId,
//           bucketStart: data.bucketStart,
//         },
//       },
//     });

//     if (existing) {
//       throw new ConflictException(
//         `Snapshot para ${data.bucketStart.toISOString()} já existe`,
//       );
//     }

//     const snapshot = await this.prisma.$transaction(async (tx) => {
//       const created = await tx.hourlySnapshot.create({
//         data: {
//           bankrollId: data.bankrollId,
//           bucketStart: data.bucketStart,
//           balance: new Decimal(data.balance),
//           unidValue: new Decimal(data.unidValue),
//           hourlyProfit: new Decimal(data.hourlyProfit),
//           hourlyROI: new Decimal(data.hourlyROI),
//           unitsChange: new Decimal(data.unitsChange),
//           cumulativeUnits: new Decimal(0),
//           peakBalance: new Decimal(data.peakBalance),
//           maxDrawdown: new Decimal(data.maxDrawdown),
//           hourlyDrawdown: new Decimal(data.hourlyDrawdown),
//           drawdownPercent: new Decimal(data.drawdownPercent),
//           betsPlaced: data.betsPlaced,
//           betsWon: data.betsWon,
//           betsLost: data.betsLost,
//           winRate: new Decimal(data.winRate),
//         },
//       });

//       await this.recalculateCumulativeUnitsFrom(
//         data.bankrollId,
//         data.bucketStart,
//         tx,
//       );

//       return created;
//     });

//     return snapshot as unknown as GetHourlySnapshotDTO;
//   }

//   async createManySnapshots(
//     snapshots: CreateHourlySnapshotDTO[],
//   ): Promise<number> {
//     if (snapshots.length === 0) return 0;

//     const ordered = [...snapshots].sort((a, b) => {
//       if (a.bankrollId !== b.bankrollId) return a.bankrollId - b.bankrollId;
//       return a.bucketStart.getTime() - b.bucketStart.getTime();
//     });

//     let count = 0;

//     await this.prisma.$transaction(async (tx) => {
//       const earliestByBankroll = new Map<number, Date>();

//       for (const data of ordered) {
//         const currentEarliest = earliestByBankroll.get(data.bankrollId);

//         if (
//           !currentEarliest ||
//           data.bucketStart.getTime() < currentEarliest.getTime()
//         ) {
//           earliestByBankroll.set(data.bankrollId, data.bucketStart);
//         }

//         await tx.hourlySnapshot.upsert({
//           where: {
//             bankrollId_bucketStart: {
//               bankrollId: data.bankrollId,
//               bucketStart: data.bucketStart,
//             },
//           },
//           update: {
//             balance: new Decimal(data.balance),
//             unidValue: new Decimal(data.unidValue),
//             hourlyProfit: new Decimal(data.hourlyProfit),
//             hourlyROI: new Decimal(data.hourlyROI),
//             unitsChange: new Decimal(data.unitsChange),
//             peakBalance: new Decimal(data.peakBalance),
//             maxDrawdown: new Decimal(data.maxDrawdown),
//             hourlyDrawdown: new Decimal(data.hourlyDrawdown),
//             drawdownPercent: new Decimal(data.drawdownPercent),
//             betsPlaced: data.betsPlaced,
//             betsWon: data.betsWon,
//             betsLost: data.betsLost,
//             winRate: new Decimal(data.winRate),
//           },
//           create: {
//             bankrollId: data.bankrollId,
//             bucketStart: data.bucketStart,
//             balance: new Decimal(data.balance),
//             unidValue: new Decimal(data.unidValue),
//             hourlyProfit: new Decimal(data.hourlyProfit),
//             hourlyROI: new Decimal(data.hourlyROI),
//             unitsChange: new Decimal(data.unitsChange),
//             cumulativeUnits: new Decimal(0),
//             peakBalance: new Decimal(data.peakBalance),
//             maxDrawdown: new Decimal(data.maxDrawdown),
//             hourlyDrawdown: new Decimal(data.hourlyDrawdown),
//             drawdownPercent: new Decimal(data.drawdownPercent),
//             betsPlaced: data.betsPlaced,
//             betsWon: data.betsWon,
//             betsLost: data.betsLost,
//             winRate: new Decimal(data.winRate),
//           },
//         });

//         count++;
//       }

//       for (const [
//         bankrollId,
//         fromBucketStart,
//       ] of earliestByBankroll.entries()) {
//         await this.recalculateCumulativeUnitsFrom(
//           bankrollId,
//           fromBucketStart,
//           tx,
//         );
//       }
//     });

//     return count;
//   }

//   async getSnapshotsByBankroll(
//     bankrollId: number,
//     userId: number,
//   ): Promise<GetHourlySnapshotDTO[]> {
//     await this.validateBankrollOwnership(bankrollId, userId);

//     const snapshots = await this.prisma.hourlySnapshot.findMany({
//       where: { bankrollId },
//       orderBy: { bucketStart: 'desc' },
//     });

//     return snapshots as unknown as GetHourlySnapshotDTO[];
//   }

//   async getSnapshotByBucketStart(
//     bankrollId: number,
//     bucketStart: Date,
//     userId: number,
//   ): Promise<GetHourlySnapshotDTO> {
//     await this.validateBankrollOwnership(bankrollId, userId);

//     const snapshot = await this.prisma.hourlySnapshot.findUnique({
//       where: {
//         bankrollId_bucketStart: {
//           bankrollId,
//           bucketStart,
//         },
//       },
//     });

//     if (!snapshot) {
//       throw new NotFoundException(
//         `Snapshot para ${bucketStart.toISOString()} não encontrado`,
//       );
//     }

//     return snapshot as unknown as GetHourlySnapshotDTO;
//   }

//   async getSnapshotById(
//     snapshotId: number,
//     userId: number,
//   ): Promise<GetHourlySnapshotDTO> {
//     return this.findSnapshotOrFail(snapshotId, userId);
//   }

//   async getLatestSnapshot(
//     bankrollId: number,
//     userId: number,
//   ): Promise<GetHourlySnapshotDTO | null> {
//     await this.validateBankrollOwnership(bankrollId, userId);

//     const snapshot = await this.prisma.hourlySnapshot.findFirst({
//       where: { bankrollId },
//       orderBy: { bucketStart: 'desc' },
//     });

//     return snapshot as unknown as GetHourlySnapshotDTO | null;
//   }

//   async getSnapshotsByDateRange(
//     bankrollId: number,
//     startDate: Date,
//     endDate: Date,
//     userId: number,
//   ): Promise<GetHourlySnapshotDTO[]> {
//     await this.validateBankrollOwnership(bankrollId, userId);

//     const snapshots = await this.prisma.hourlySnapshot.findMany({
//       where: {
//         bankrollId,
//         bucketStart: {
//           gte: startDate,
//           lt: endDate,
//         },
//       },
//       orderBy: { bucketStart: 'desc' },
//     });

//     return snapshots as unknown as GetHourlySnapshotDTO[];
//   }

//   async updateSnapshot(
//     snapshotId: number,
//     data: Partial<CreateHourlySnapshotDTO>,
//     userId: number,
//   ): Promise<GetHourlySnapshotDTO> {
//     const current = await this.findSnapshotOrFail(snapshotId, userId);

//     const originalBucketStart = current.bucketStart;
//     const nextBucketStart = data.bucketStart ?? current.bucketStart;

//     const updateData: Prisma.HourlySnapshotUpdateInput = {};

//     if (data.bucketStart !== undefined) {
//       updateData.bucketStart = data.bucketStart;
//     }

//     if (data.balance !== undefined)
//       updateData.balance = new Decimal(data.balance);
//     if (data.unidValue !== undefined)
//       updateData.unidValue = new Decimal(data.unidValue);
//     if (data.hourlyProfit !== undefined)
//       updateData.hourlyProfit = new Decimal(data.hourlyProfit);
//     if (data.hourlyROI !== undefined)
//       updateData.hourlyROI = new Decimal(data.hourlyROI);
//     if (data.unitsChange !== undefined)
//       updateData.unitsChange = new Decimal(data.unitsChange);
//     if (data.peakBalance !== undefined)
//       updateData.peakBalance = new Decimal(data.peakBalance);
//     if (data.maxDrawdown !== undefined)
//       updateData.maxDrawdown = new Decimal(data.maxDrawdown);
//     if (data.hourlyDrawdown !== undefined)
//       updateData.hourlyDrawdown = new Decimal(data.hourlyDrawdown);
//     if (data.drawdownPercent !== undefined)
//       updateData.drawdownPercent = new Decimal(data.drawdownPercent);

//     if (data.betsPlaced !== undefined) updateData.betsPlaced = data.betsPlaced;
//     if (data.betsWon !== undefined) updateData.betsWon = data.betsWon;
//     if (data.betsLost !== undefined) updateData.betsLost = data.betsLost;
//     if (data.winRate !== undefined)
//       updateData.winRate = new Decimal(data.winRate);

//     const recalcFrom =
//       originalBucketStart < nextBucketStart
//         ? originalBucketStart
//         : nextBucketStart;

//     const updated = await this.prisma.$transaction(async (tx) => {
//       const result = await tx.hourlySnapshot.update({
//         where: { id: snapshotId },
//         data: updateData,
//       });

//       await this.recalculateCumulativeUnitsFrom(
//         current.bankrollId,
//         recalcFrom,
//         tx,
//       );

//       return result;
//     });

//     return updated as unknown as GetHourlySnapshotDTO;
//   }

//   async deleteSnapshot(snapshotId: number, userId: number): Promise<void> {
//     const snapshot = await this.findSnapshotOrFail(snapshotId, userId);

//     await this.prisma.$transaction(async (tx) => {
//       await tx.hourlySnapshot.delete({
//         where: { id: snapshotId },
//       });

//       await this.recalculateCumulativeUnitsFrom(
//         snapshot.bankrollId,
//         snapshot.bucketStart,
//         tx,
//       );
//     });
//   }

//   async deleteSnapshotsByDateRange(
//     bankrollId: number,
//     startDate: Date,
//     endDate: Date,
//     userId: number,
//   ): Promise<number> {
//     await this.validateBankrollOwnership(bankrollId, userId);

//     const result = await this.prisma.$transaction(async (tx) => {
//       const deleted = await tx.hourlySnapshot.deleteMany({
//         where: {
//           bankrollId,
//           bucketStart: {
//             gte: startDate,
//             lt: endDate,
//           },
//         },
//       });

//       await this.recalculateCumulativeUnitsFrom(bankrollId, startDate, tx);

//       return deleted;
//     });

//     return result.count;
//   }

//   private async recalculateCumulativeUnitsFrom(
//     bankrollId: number,
//     fromBucketStart: Date,
//     tx: Prisma.TransactionClient = this.prisma,
//   ): Promise<void> {
//     const previous = await tx.hourlySnapshot.findFirst({
//       where: {
//         bankrollId,
//         bucketStart: { lt: fromBucketStart },
//       },
//       orderBy: { bucketStart: 'desc' },
//     });

//     let runningCumulative = new Decimal(previous?.cumulativeUnits ?? 0);

//     const snapshotsToRecalculate = await tx.hourlySnapshot.findMany({
//       where: {
//         bankrollId,
//         bucketStart: { gte: fromBucketStart },
//       },
//       orderBy: { bucketStart: 'asc' },
//     });

//     for (const snapshot of snapshotsToRecalculate) {
//       runningCumulative = runningCumulative.plus(
//         new Decimal(snapshot.unitsChange ?? 0),
//       );

//       await tx.hourlySnapshot.update({
//         where: { id: snapshot.id },
//         data: {
//           cumulativeUnits: runningCumulative,
//         },
//       });
//     }
//   }

//   async rebuildCumulativeUnits(bankrollId: number): Promise<void> {
//     const snapshots = await this.prisma.hourlySnapshot.findMany({
//       where: { bankrollId },
//       orderBy: { bucketStart: 'asc' },
//     });

//     let running = new Decimal(0);

//     await this.prisma.$transaction(async (tx) => {
//       for (const snapshot of snapshots) {
//         running = running.plus(new Decimal(snapshot.unitsChange ?? 0));

//         await tx.hourlySnapshot.update({
//           where: { id: snapshot.id },
//           data: {
//             cumulativeUnits: running,
//           },
//         });
//       }
//     });
//   }
// }
