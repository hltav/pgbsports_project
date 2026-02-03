import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService, Decimal } from '../../../../libs/database';
import { Prisma } from '@prisma/client';
import {
  CreateYearlySnapshotDTO,
  GetYearlySnapshotDTO,
} from '../dto/yearlySnapshot.dto';

@Injectable()
export class BankrollYearlySnapshotService {
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
  ): Promise<GetYearlySnapshotDTO> {
    const snapshot = await this.prisma.yearlySnapshot.findUnique({
      where: { id: snapshotId },
      include: { bankroll: true },
    });

    if (!snapshot) {
      throw new NotFoundException(`Snapshot ${snapshotId} não encontrado`);
    }

    if (snapshot.bankroll.userId !== userId) {
      throw new ForbiddenException('Acesso negado a este snapshot');
    }

    return snapshot as unknown as GetYearlySnapshotDTO;
  }

  // CREATE
  async createSnapshot(
    data: CreateYearlySnapshotDTO,
    userId: number,
  ): Promise<GetYearlySnapshotDTO> {
    await this.validateBankrollOwnership(data.bankrollId, userId);

    // Verifica se já existe snapshot para este ano
    const existing = await this.prisma.yearlySnapshot.findUnique({
      where: {
        bankrollId_year: {
          bankrollId: data.bankrollId,
          year: data.year,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Snapshot para o ano ${data.year} já existe`);
    }

    const snapshot = await this.prisma.yearlySnapshot.create({
      data: {
        bankrollId: data.bankrollId,
        year: data.year,
        balance: new Decimal(data.balance),
        unidValue: new Decimal(data.unidValue),
        yearlyProfit: new Decimal(data.yearlyProfit),
        yearlyROI: new Decimal(data.yearlyROI),
        unitsChange: new Decimal(data.unitsChange),
        peakBalance: new Decimal(data.peakBalance),
        maxDrawdown: new Decimal(data.maxDrawdown),
        drawdownPercent: new Decimal(data.drawdownPercent),
        betsPlaced: data.betsPlaced,
        betsWon: data.betsWon,
        betsLost: data.betsLost,
        winRate: new Decimal(data.winRate),
      },
    });

    return snapshot as unknown as GetYearlySnapshotDTO;
  }

  /**
   * Cria múltiplos snapshots anuais em lote.
   * Suporta transações para garantir atomicidade.
   */
  async createManySnapshots(
    data: CreateYearlySnapshotDTO[],
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    if (data.length === 0) return 0;

    const prisma = tx ?? this.prisma;

    // Mapeamento para garantir tipos Decimal e valores padrão
    const snapshotsToInsert = data.map((item) => ({
      bankrollId: item.bankrollId,
      year: item.year,
      balance: new Decimal(item.balance),
      unidValue: new Decimal(item.unidValue),
      yearlyProfit: new Decimal(item.yearlyProfit),
      yearlyROI: new Decimal(item.yearlyROI),
      unitsChange: new Decimal(item.unitsChange),
      peakBalance: new Decimal(item.peakBalance),
      maxDrawdown: new Decimal(item.maxDrawdown),
      drawdownPercent: new Decimal(item.drawdownPercent),
      betsPlaced: item.betsPlaced ?? 0,
      betsWon: item.betsWon ?? 0,
      betsLost: item.betsLost ?? 0,
      winRate: new Decimal(item.winRate ?? 0),
    }));

    const result = await prisma.yearlySnapshot.createMany({
      data: snapshotsToInsert,
      skipDuplicates: true, // Segurança contra duplicatas no lote
    });

    return result.count;
  }

  // READ
  async getSnapshotsByBankroll(
    bankrollId: number,
    userId: number,
  ): Promise<GetYearlySnapshotDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshots = await this.prisma.yearlySnapshot.findMany({
      where: { bankrollId },
      orderBy: { year: 'desc' },
    });

    return snapshots as unknown as GetYearlySnapshotDTO[];
  }

  async getSnapshotByYear(
    bankrollId: number,
    year: number,
    userId: number,
  ): Promise<GetYearlySnapshotDTO> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshot = await this.prisma.yearlySnapshot.findUnique({
      where: {
        bankrollId_year: {
          bankrollId,
          year,
        },
      },
    });

    if (!snapshot) {
      throw new NotFoundException(`Snapshot para o ano ${year} não encontrado`);
    }

    return snapshot as unknown as GetYearlySnapshotDTO;
  }

  async getSnapshotById(
    snapshotId: number,
    userId: number,
  ): Promise<GetYearlySnapshotDTO> {
    return this.findSnapshotOrFail(snapshotId, userId);
  }

  async getLatestSnapshot(
    bankrollId: number,
    userId: number,
  ): Promise<GetYearlySnapshotDTO | null> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshot = await this.prisma.yearlySnapshot.findFirst({
      where: { bankrollId },
      orderBy: { year: 'desc' },
    });

    return snapshot as unknown as GetYearlySnapshotDTO | null;
  }

  async getSnapshotsByYearRange(
    bankrollId: number,
    startYear: number,
    endYear: number,
    userId: number,
  ): Promise<GetYearlySnapshotDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshots = await this.prisma.yearlySnapshot.findMany({
      where: {
        bankrollId,
        year: {
          gte: startYear,
          lte: endYear,
        },
      },
      orderBy: { year: 'desc' },
    });

    return snapshots as unknown as GetYearlySnapshotDTO[];
  }

  // UPDATE
  async updateSnapshot(
    snapshotId: number,
    data: Partial<CreateYearlySnapshotDTO>,
    userId: number,
  ): Promise<GetYearlySnapshotDTO> {
    await this.findSnapshotOrFail(snapshotId, userId);

    const updateData: Prisma.YearlySnapshotUpdateInput = {};

    if (data.balance !== undefined)
      updateData.balance = new Decimal(data.balance);
    if (data.unidValue !== undefined)
      updateData.unidValue = new Decimal(data.unidValue);
    if (data.yearlyProfit !== undefined)
      updateData.yearlyProfit = new Decimal(data.yearlyProfit);
    if (data.yearlyROI !== undefined)
      updateData.yearlyROI = new Decimal(data.yearlyROI);
    if (data.unitsChange !== undefined)
      updateData.unitsChange = new Decimal(data.unitsChange);
    if (data.peakBalance !== undefined)
      updateData.peakBalance = new Decimal(data.peakBalance);
    if (data.maxDrawdown !== undefined)
      updateData.maxDrawdown = new Decimal(data.maxDrawdown);
    if (data.drawdownPercent !== undefined)
      updateData.drawdownPercent = new Decimal(data.drawdownPercent);
    if (data.betsPlaced !== undefined) updateData.betsPlaced = data.betsPlaced;
    if (data.betsWon !== undefined) updateData.betsWon = data.betsWon;
    if (data.betsLost !== undefined) updateData.betsLost = data.betsLost;
    if (data.winRate !== undefined)
      updateData.winRate = new Decimal(data.winRate);

    const updated = await this.prisma.yearlySnapshot.update({
      where: { id: snapshotId },
      data: updateData,
    });

    return updated as unknown as GetYearlySnapshotDTO;
  }

  // DELETE
  async deleteSnapshot(snapshotId: number, userId: number): Promise<void> {
    await this.findSnapshotOrFail(snapshotId, userId);

    await this.prisma.yearlySnapshot.delete({
      where: { id: snapshotId },
    });
  }

  async deleteSnapshotsByYearRange(
    bankrollId: number,
    startYear: number,
    endYear: number,
    userId: number,
  ): Promise<number> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const result = await this.prisma.yearlySnapshot.deleteMany({
      where: {
        bankrollId,
        year: {
          gte: startYear,
          lte: endYear,
        },
      },
    });

    return result.count;
  }
}
