import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService, Decimal } from './../../../../libs/database';
import { Prisma } from '@prisma/client';
import {
  CreateDailySnapshotDTO,
  GetDailySnapshotDTO,
} from '../dto/dailySnapshot.dto';

@Injectable()
export class BankrollDailySnapshotService {
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
  ): Promise<GetDailySnapshotDTO> {
    const snapshot = await this.prisma.dailySnapshot.findUnique({
      where: { id: snapshotId },
      include: { bankroll: true },
    });

    if (!snapshot) {
      throw new NotFoundException(`Snapshot ${snapshotId} não encontrado`);
    }

    if (snapshot.bankroll.userId !== userId) {
      throw new ForbiddenException('Acesso negado a este snapshot');
    }

    return snapshot as unknown as GetDailySnapshotDTO;
  }

  // CREATE
  async createSnapshot(
    data: CreateDailySnapshotDTO,
    userId: number,
  ): Promise<GetDailySnapshotDTO> {
    await this.validateBankrollOwnership(data.bankrollId, userId);

    // Verifica se já existe snapshot para este dia
    const existing = await this.prisma.dailySnapshot.findUnique({
      where: {
        bankrollId_year_month_day: {
          bankrollId: data.bankrollId,
          year: data.year,
          month: data.month,
          day: data.day,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Snapshot para ${data.day}/${data.month}/${data.year} já existe`,
      );
    }

    const snapshot = await this.prisma.dailySnapshot.create({
      data: {
        bankrollId: data.bankrollId,
        year: data.year,
        month: data.month,
        day: data.day,
        balance: new Decimal(data.balance),
        unidValue: new Decimal(data.unidValue),
        dailyProfit: new Decimal(data.dailyProfit),
        dailyROI: new Decimal(data.dailyROI),
        unitsChange: new Decimal(data.unitsChange),
        peakBalance: new Decimal(data.peakBalance),
        maxDrawdown: new Decimal(data.maxDrawdown),
        dailyDrawdown: new Decimal(data.dailyDrawdown),
        drawdownPercent: new Decimal(data.drawdownPercent),
        betsPlaced: data.betsPlaced,
        betsWon: data.betsWon,
        betsLost: data.betsLost,
        winRate: new Decimal(data.winRate),
      },
    });

    return snapshot as unknown as GetDailySnapshotDTO;
  }

  /**
   * Cria snapshots em massa.
   * Ideal para ser chamado por Jobs de fechamento diário ou Backfills.
   */
  async createManySnapshots(
    snapshots: CreateDailySnapshotDTO[],
  ): Promise<number> {
    // Nota: createMany não executa validações de ownership por performance.
    // Assume-se que o chamador (Job) já filtrou os dados corretamente.
    const result = await this.prisma.dailySnapshot.createMany({
      data: snapshots.map((data) => ({
        ...data,
        balance: new Decimal(data.balance),
        unidValue: new Decimal(data.unidValue),
        dailyProfit: new Decimal(data.dailyProfit),
        dailyROI: new Decimal(data.dailyROI),
        unitsChange: new Decimal(data.unitsChange),
        peakBalance: new Decimal(data.peakBalance),
        maxDrawdown: new Decimal(data.maxDrawdown),
        dailyDrawdown: new Decimal(data.dailyDrawdown),
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
  ): Promise<GetDailySnapshotDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshots = await this.prisma.dailySnapshot.findMany({
      where: { bankrollId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { day: 'desc' }],
    });

    return snapshots as unknown as GetDailySnapshotDTO[];
  }

  async getSnapshotByDate(
    bankrollId: number,
    year: number,
    month: number,
    day: number,
    userId: number,
  ): Promise<GetDailySnapshotDTO> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshot = await this.prisma.dailySnapshot.findUnique({
      where: {
        bankrollId_year_month_day: {
          bankrollId,
          year,
          month,
          day,
        },
      },
    });

    if (!snapshot) {
      throw new NotFoundException(
        `Snapshot para ${day}/${month}/${year} não encontrado`,
      );
    }

    return snapshot as unknown as GetDailySnapshotDTO;
  }

  async getSnapshotsByMonth(
    bankrollId: number,
    year: number,
    month: number,
    userId: number,
  ): Promise<GetDailySnapshotDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshots = await this.prisma.dailySnapshot.findMany({
      where: {
        bankrollId,
        year,
        month,
      },
      orderBy: { day: 'desc' },
    });

    return snapshots as unknown as GetDailySnapshotDTO[];
  }

  async getSnapshotsByYear(
    bankrollId: number,
    year: number,
    userId: number,
  ): Promise<GetDailySnapshotDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshots = await this.prisma.dailySnapshot.findMany({
      where: {
        bankrollId,
        year,
      },
      orderBy: [{ month: 'desc' }, { day: 'desc' }],
    });

    return snapshots as unknown as GetDailySnapshotDTO[];
  }

  async getSnapshotById(
    snapshotId: number,
    userId: number,
  ): Promise<GetDailySnapshotDTO> {
    return this.findSnapshotOrFail(snapshotId, userId);
  }

  async getLatestSnapshot(
    bankrollId: number,
    userId: number,
  ): Promise<GetDailySnapshotDTO | null> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshot = await this.prisma.dailySnapshot.findFirst({
      where: { bankrollId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { day: 'desc' }],
    });

    return snapshot as unknown as GetDailySnapshotDTO | null;
  }

  async getSnapshotsByDateRange(
    bankrollId: number,
    startDate: Date,
    endDate: Date,
    userId: number,
  ): Promise<GetDailySnapshotDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth() + 1;
    const startDay = startDate.getDate();

    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth() + 1;
    const endDay = endDate.getDate();

    const snapshots = await this.prisma.dailySnapshot.findMany({
      where: {
        bankrollId,
        OR: [
          { year: { gt: startYear, lt: endYear } },
          {
            year: startYear,
            OR: [
              { month: { gt: startMonth } },
              { month: startMonth, day: { gte: startDay } },
            ],
          },
          {
            year: endYear,
            OR: [
              { month: { lt: endMonth } },
              { month: endMonth, day: { lte: endDay } },
            ],
          },
        ],
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { day: 'desc' }],
    });

    return snapshots as unknown as GetDailySnapshotDTO[];
  }

  // UPDATE
  async updateSnapshot(
    snapshotId: number,
    data: Partial<CreateDailySnapshotDTO>,
    userId: number,
  ): Promise<GetDailySnapshotDTO> {
    await this.findSnapshotOrFail(snapshotId, userId);

    const updateData: Prisma.DailySnapshotUpdateInput = {};

    if (data.balance !== undefined)
      updateData.balance = new Decimal(data.balance);
    if (data.unidValue !== undefined)
      updateData.unidValue = new Decimal(data.unidValue);
    if (data.dailyProfit !== undefined)
      updateData.dailyProfit = new Decimal(data.dailyProfit);
    if (data.dailyROI !== undefined)
      updateData.dailyROI = new Decimal(data.dailyROI);
    if (data.unitsChange !== undefined)
      updateData.unitsChange = new Decimal(data.unitsChange);
    if (data.peakBalance !== undefined)
      updateData.peakBalance = new Decimal(data.peakBalance);
    if (data.maxDrawdown !== undefined)
      updateData.maxDrawdown = new Decimal(data.maxDrawdown);
    if (data.dailyDrawdown !== undefined)
      updateData.dailyDrawdown = new Decimal(data.dailyDrawdown);
    if (data.drawdownPercent !== undefined)
      updateData.drawdownPercent = new Decimal(data.drawdownPercent);
    if (data.betsPlaced !== undefined) updateData.betsPlaced = data.betsPlaced;
    if (data.betsWon !== undefined) updateData.betsWon = data.betsWon;
    if (data.betsLost !== undefined) updateData.betsLost = data.betsLost;
    if (data.winRate !== undefined)
      updateData.winRate = new Decimal(data.winRate);

    const updated = await this.prisma.dailySnapshot.update({
      where: { id: snapshotId },
      data: updateData,
    });

    return updated as unknown as GetDailySnapshotDTO;
  }

  // DELETE
  async deleteSnapshot(snapshotId: number, userId: number): Promise<void> {
    await this.findSnapshotOrFail(snapshotId, userId);

    await this.prisma.dailySnapshot.delete({
      where: { id: snapshotId },
    });
  }

  async deleteSnapshotsByMonth(
    bankrollId: number,
    year: number,
    month: number,
    userId: number,
  ): Promise<number> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const result = await this.prisma.dailySnapshot.deleteMany({
      where: {
        bankrollId,
        year,
        month,
      },
    });

    return result.count;
  }

  async deleteSnapshotsByYear(
    bankrollId: number,
    year: number,
    userId: number,
  ): Promise<number> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const result = await this.prisma.dailySnapshot.deleteMany({
      where: {
        bankrollId,
        year,
      },
    });

    return result.count;
  }
}
