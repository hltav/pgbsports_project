import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService, Decimal } from './../../../../libs/database';
import {
  CreateHourlySnapshotDTO,
  GetHourlySnapshotDTO,
} from '../dto/hourlySnapshot.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BankrollHourlySnapshotService {
  constructor(private readonly prisma: PrismaService) {}

  // HELPERS
  private async validateBankrollOwnership(
    bankrollId: number,
    userId: number,
  ): Promise<void> {
    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id: bankrollId },
    });

    if (!bankroll) {
      throw new NotFoundException(`Bankroll ${bankrollId} não encontrado`);
    }

    if (bankroll.userId !== userId) {
      throw new ForbiddenException('Acesso negado a este bankroll');
    }
  }

  private async findSnapshotOrFail(
    snapshotId: number,
    userId: number,
  ): Promise<GetHourlySnapshotDTO> {
    const snapshot = await this.prisma.hourlySnapshot.findUnique({
      where: { id: snapshotId },
      include: { bankroll: true },
    });

    if (!snapshot) {
      throw new NotFoundException(`Snapshot ${snapshotId} não encontrado`);
    }

    if (snapshot.bankroll.userId !== userId) {
      throw new ForbiddenException('Acesso negado a este snapshot');
    }

    return snapshot as unknown as GetHourlySnapshotDTO;
  }

  // CREATE
  async createSnapshot(
    data: CreateHourlySnapshotDTO,
    userId: number,
  ): Promise<GetHourlySnapshotDTO> {
    await this.validateBankrollOwnership(data.bankrollId, userId);

    // Verifica se já existe snapshot para este bucketStart
    const existing = await this.prisma.hourlySnapshot.findUnique({
      where: {
        bankrollId_bucketStart: {
          bankrollId: data.bankrollId,
          bucketStart: data.bucketStart,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Snapshot para ${data.bucketStart.toISOString()} já existe`,
      );
    }

    const snapshot = await this.prisma.hourlySnapshot.create({
      data: {
        bankrollId: data.bankrollId,
        bucketStart: data.bucketStart,

        balance: new Decimal(data.balance),
        unidValue: new Decimal(data.unidValue),

        hourlyProfit: new Decimal(data.hourlyProfit),
        hourlyROI: new Decimal(data.hourlyROI),
        unitsChange: new Decimal(data.unitsChange),

        peakBalance: new Decimal(data.peakBalance),
        maxDrawdown: new Decimal(data.maxDrawdown),
        hourlyDrawdown: new Decimal(data.hourlyDrawdown),
        drawdownPercent: new Decimal(data.drawdownPercent),

        betsPlaced: data.betsPlaced,
        betsWon: data.betsWon,
        betsLost: data.betsLost,
        winRate: new Decimal(data.winRate),
      },
    });

    return snapshot as unknown as GetHourlySnapshotDTO;
  }

  /**
   * Cria snapshots em massa.
   * Ideal para ser chamado por Jobs de fechamento horário ou Backfills.
   */
  async createManySnapshots(
    snapshots: CreateHourlySnapshotDTO[],
  ): Promise<number> {
    // Nota: createMany não executa validações de ownership por performance.
    // Assume-se que o chamador (Job) já filtrou os dados corretamente.
    const result = await this.prisma.hourlySnapshot.createMany({
      data: snapshots.map((data) => ({
        ...data,
        balance: new Decimal(data.balance),
        unidValue: new Decimal(data.unidValue),
        hourlyProfit: new Decimal(data.hourlyProfit),
        hourlyROI: new Decimal(data.hourlyROI),
        unitsChange: new Decimal(data.unitsChange),
        peakBalance: new Decimal(data.peakBalance),
        maxDrawdown: new Decimal(data.maxDrawdown),
        hourlyDrawdown: new Decimal(data.hourlyDrawdown),
        drawdownPercent: new Decimal(data.drawdownPercent),
        winRate: new Decimal(data.winRate),
      })),
      skipDuplicates: true,
    });

    return result.count;
  }

  // READ
  async getSnapshotsByBankroll(
    bankrollId: number,
    userId: number,
  ): Promise<GetHourlySnapshotDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshots = await this.prisma.hourlySnapshot.findMany({
      where: { bankrollId },
      orderBy: { bucketStart: 'desc' },
    });

    return snapshots as unknown as GetHourlySnapshotDTO[];
  }

  async getSnapshotByBucketStart(
    bankrollId: number,
    bucketStart: Date,
    userId: number,
  ): Promise<GetHourlySnapshotDTO> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshot = await this.prisma.hourlySnapshot.findUnique({
      where: {
        bankrollId_bucketStart: {
          bankrollId,
          bucketStart,
        },
      },
    });

    if (!snapshot) {
      throw new NotFoundException(
        `Snapshot para ${bucketStart.toISOString()} não encontrado`,
      );
    }

    return snapshot as unknown as GetHourlySnapshotDTO;
  }

  async getSnapshotById(
    snapshotId: number,
    userId: number,
  ): Promise<GetHourlySnapshotDTO> {
    return this.findSnapshotOrFail(snapshotId, userId);
  }

  async getLatestSnapshot(
    bankrollId: number,
    userId: number,
  ): Promise<GetHourlySnapshotDTO | null> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshot = await this.prisma.hourlySnapshot.findFirst({
      where: { bankrollId },
      orderBy: { bucketStart: 'desc' },
    });

    return snapshot as unknown as GetHourlySnapshotDTO | null;
  }

  async getSnapshotsByDateRange(
    bankrollId: number,
    startDate: Date,
    endDate: Date,
    userId: number,
  ): Promise<GetHourlySnapshotDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshots = await this.prisma.hourlySnapshot.findMany({
      where: {
        bankrollId,
        bucketStart: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { bucketStart: 'desc' },
    });

    return snapshots as unknown as GetHourlySnapshotDTO[];
  }

  // UPDATE
  async updateSnapshot(
    snapshotId: number,
    data: Partial<CreateHourlySnapshotDTO>,
    userId: number,
  ): Promise<GetHourlySnapshotDTO> {
    await this.findSnapshotOrFail(snapshotId, userId);

    const updateData: Prisma.HourlySnapshotUpdateInput = {};

    if (data.bucketStart !== undefined)
      updateData.bucketStart = data.bucketStart;

    if (data.balance !== undefined)
      updateData.balance = new Decimal(data.balance);
    if (data.unidValue !== undefined)
      updateData.unidValue = new Decimal(data.unidValue);

    if (data.hourlyProfit !== undefined)
      updateData.hourlyProfit = new Decimal(data.hourlyProfit);
    if (data.hourlyROI !== undefined)
      updateData.hourlyROI = new Decimal(data.hourlyROI);
    if (data.unitsChange !== undefined)
      updateData.unitsChange = new Decimal(data.unitsChange);

    if (data.peakBalance !== undefined)
      updateData.peakBalance = new Decimal(data.peakBalance);
    if (data.maxDrawdown !== undefined)
      updateData.maxDrawdown = new Decimal(data.maxDrawdown);
    if (data.hourlyDrawdown !== undefined)
      updateData.hourlyDrawdown = new Decimal(data.hourlyDrawdown);
    if (data.drawdownPercent !== undefined)
      updateData.drawdownPercent = new Decimal(data.drawdownPercent);

    if (data.betsPlaced !== undefined) updateData.betsPlaced = data.betsPlaced;
    if (data.betsWon !== undefined) updateData.betsWon = data.betsWon;
    if (data.betsLost !== undefined) updateData.betsLost = data.betsLost;
    if (data.winRate !== undefined)
      updateData.winRate = new Decimal(data.winRate);

    const updated = await this.prisma.hourlySnapshot.update({
      where: { id: snapshotId },
      data: updateData,
    });

    return updated as unknown as GetHourlySnapshotDTO;
  }

  // DELETE
  async deleteSnapshot(snapshotId: number, userId: number): Promise<void> {
    await this.findSnapshotOrFail(snapshotId, userId);

    await this.prisma.hourlySnapshot.delete({
      where: { id: snapshotId },
    });
  }

  async deleteSnapshotsByDateRange(
    bankrollId: number,
    startDate: Date,
    endDate: Date,
    userId: number,
  ): Promise<number> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const result = await this.prisma.hourlySnapshot.deleteMany({
      where: {
        bankrollId,
        bucketStart: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    return result.count;
  }
}
