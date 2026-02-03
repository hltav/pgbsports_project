import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService, Decimal } from '../../../../libs/database';
import { Prisma } from '@prisma/client';
import {
  GetMonthlySnapshotDTO,
  CreateMonthlySnapshotDTO,
} from '../dto/monthlySnapshot.dto';

@Injectable()
export class BankrollMonthlySnapshotService {
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
  ): Promise<GetMonthlySnapshotDTO> {
    const snapshot = await this.prisma.monthlySnapshot.findUnique({
      where: { id: snapshotId },
      include: { bankroll: true },
    });

    if (!snapshot) {
      throw new NotFoundException(`Snapshot ${snapshotId} não encontrado`);
    }

    if (snapshot.bankroll.userId !== userId) {
      throw new ForbiddenException('Acesso negado a este snapshot');
    }

    return snapshot as unknown as GetMonthlySnapshotDTO;
  }

  // CREATE
  async createSnapshot(
    data: CreateMonthlySnapshotDTO,
    userId: number,
  ): Promise<GetMonthlySnapshotDTO> {
    await this.validateBankrollOwnership(data.bankrollId, userId);

    // Verifica se já existe snapshot para este mês
    const existing = await this.prisma.monthlySnapshot.findUnique({
      where: {
        bankrollId_year_month: {
          bankrollId: data.bankrollId,
          year: data.year,
          month: data.month,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Snapshot para mês ${data.month}/${data.year} já existe`,
      );
    }

    const snapshot = await this.prisma.monthlySnapshot.create({
      data: {
        bankrollId: data.bankrollId,
        year: data.year,
        month: data.month,
        balance: new Decimal(data.balance),
        unidValue: new Decimal(data.unidValue),
        monthlyProfit: new Decimal(data.monthlyProfit),
        monthlyROI: new Decimal(data.monthlyROI),
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

    return snapshot as unknown as GetMonthlySnapshotDTO;
  }

  /**
   * Cria múltiplos snapshots mensais em lote.
   * Otimizado para ser chamado por Jobs de sistema.
   */
  async createManySnapshots(
    data: CreateMonthlySnapshotDTO[],
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    if (data.length === 0) return 0;

    // Usa a transação se fornecida, caso contrário usa o prisma normal
    const prisma = tx ?? this.prisma;

    // Prepara os dados convertendo para os tipos do Prisma/Decimal
    const snapshotsToInsert = data.map((item) => ({
      bankrollId: item.bankrollId,
      year: item.year,
      month: item.month,
      balance: new Decimal(item.balance),
      unidValue: new Decimal(item.unidValue),
      monthlyProfit: new Decimal(item.monthlyProfit),
      monthlyROI: new Decimal(item.monthlyROI),
      unitsChange: new Decimal(item.unitsChange),
      peakBalance: new Decimal(item.peakBalance),
      maxDrawdown: new Decimal(item.maxDrawdown),
      drawdownPercent: new Decimal(item.drawdownPercent),
      betsPlaced: item.betsPlaced ?? 0,
      betsWon: item.betsWon ?? 0,
      betsLost: item.betsLost ?? 0,
      winRate: new Decimal(item.winRate ?? 0),
    }));

    // Executa a inserção em lote ignorando duplicatas por segurança
    const result = await prisma.monthlySnapshot.createMany({
      data: snapshotsToInsert,
      skipDuplicates: true,
    });

    return result.count;
  }

  // READ
  async getSnapshotsByBankroll(
    bankrollId: number,
    userId: number,
  ): Promise<GetMonthlySnapshotDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshots = await this.prisma.monthlySnapshot.findMany({
      where: { bankrollId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return snapshots as unknown as GetMonthlySnapshotDTO[];
  }

  async getSnapshotByMonth(
    bankrollId: number,
    year: number,
    month: number,
    userId: number,
  ): Promise<GetMonthlySnapshotDTO> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshot = await this.prisma.monthlySnapshot.findUnique({
      where: {
        bankrollId_year_month: {
          bankrollId,
          year,
          month,
        },
      },
    });

    if (!snapshot) {
      throw new NotFoundException(
        `Snapshot para mês ${month}/${year} não encontrado`,
      );
    }

    return snapshot as unknown as GetMonthlySnapshotDTO;
  }

  async getSnapshotsByYear(
    bankrollId: number,
    year: number,
    userId: number,
  ): Promise<GetMonthlySnapshotDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshots = await this.prisma.monthlySnapshot.findMany({
      where: {
        bankrollId,
        year,
      },
      orderBy: { month: 'desc' },
    });

    return snapshots as unknown as GetMonthlySnapshotDTO[];
  }

  async getSnapshotById(
    snapshotId: number,
    userId: number,
  ): Promise<GetMonthlySnapshotDTO> {
    return this.findSnapshotOrFail(snapshotId, userId);
  }

  async getLatestSnapshot(
    bankrollId: number,
    userId: number,
  ): Promise<GetMonthlySnapshotDTO | null> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshot = await this.prisma.monthlySnapshot.findFirst({
      where: { bankrollId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return snapshot as unknown as GetMonthlySnapshotDTO | null;
  }

  // UPDATE
  async updateSnapshot(
    snapshotId: number,
    data: Partial<CreateMonthlySnapshotDTO>,
    userId: number,
  ): Promise<GetMonthlySnapshotDTO> {
    await this.findSnapshotOrFail(snapshotId, userId);

    const updateData: Prisma.MonthlySnapshotUpdateInput = {};

    if (data.balance !== undefined)
      updateData.balance = new Decimal(data.balance);
    if (data.unidValue !== undefined)
      updateData.unidValue = new Decimal(data.unidValue);
    if (data.monthlyProfit !== undefined)
      updateData.monthlyProfit = new Decimal(data.monthlyProfit);
    if (data.monthlyROI !== undefined)
      updateData.monthlyROI = new Decimal(data.monthlyROI);
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

    const updated = await this.prisma.monthlySnapshot.update({
      where: { id: snapshotId },
      data: updateData,
    });

    return updated as unknown as GetMonthlySnapshotDTO;
  }

  // DELETE
  async deleteSnapshot(snapshotId: number, userId: number): Promise<void> {
    await this.findSnapshotOrFail(snapshotId, userId);

    await this.prisma.monthlySnapshot.delete({
      where: { id: snapshotId },
    });
  }

  async deleteSnapshotsByYear(
    bankrollId: number,
    year: number,
    userId: number,
  ): Promise<number> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const result = await this.prisma.monthlySnapshot.deleteMany({
      where: {
        bankrollId,
        year,
      },
    });

    return result.count;
  }
}
