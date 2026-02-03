import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService, Decimal } from './../../../../libs/database';
import { Prisma, WeeklySnapshot } from '@prisma/client';
import {
  GetWeeklySnapshotDTO,
  CreateWeeklySnapshotDTO,
} from '../dto/weeklySnapshot.dto';

@Injectable()
export class BankrollWeeklySnapshotService {
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
  ): Promise<GetWeeklySnapshotDTO> {
    const snapshot = await this.prisma.weeklySnapshot.findUnique({
      where: { id: snapshotId },
      include: { bankroll: true },
    });

    if (!snapshot) {
      throw new NotFoundException(`Snapshot ${snapshotId} não encontrado`);
    }

    if (snapshot.bankroll.userId !== userId) {
      throw new ForbiddenException('Acesso negado a este snapshot');
    }

    return snapshot as unknown as GetWeeklySnapshotDTO;
  }

  // CREATE
  async createSnapshot(
    data: CreateWeeklySnapshotDTO,
    userId: number,
  ): Promise<GetWeeklySnapshotDTO> {
    await this.validateBankrollOwnership(data.bankrollId, userId);

    // Verifica se já existe snapshot para esta semana
    const existing = await this.prisma.weeklySnapshot.findUnique({
      where: {
        bankrollId_year_week: {
          bankrollId: data.bankrollId,
          year: data.year,
          week: data.week,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Snapshot para semana ${data.week}/${data.year} já existe`,
      );
    }

    const snapshot = await this.prisma.weeklySnapshot.create({
      data: {
        bankrollId: data.bankrollId,
        year: data.year,
        week: data.week,
        balance: new Decimal(data.balance),
        unidValue: new Decimal(data.unidValue),
        weeklyProfit: new Decimal(data.weeklyProfit),
        weeklyROI: new Decimal(data.weeklyROI),
        unitsChange: new Decimal(data.unitsChange),
        peakBalance: new Decimal(data.peakBalance),
        maxDrawdown: new Decimal(data.maxDrawdown),
        drawdownPercent: new Decimal(data.drawdownPercent),
        betsPlaced: data.betsPlaced ?? 0,
        betsWon: data.betsWon ?? 0,
        betsLost: data.betsLost ?? 0,
        winRate: new Decimal(data.winRate ?? 0),
      },
    });

    return this.mapToGetWeeklySnapshotDTO(snapshot);
  }

  /**
   * Cria múltiplos snapshots semanais em uma única operação.
   * Utilizado principalmente por Jobs de sistema para alta performance.
   */
  async createManySnapshots(
    data: CreateWeeklySnapshotDTO[],
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    if (data.length === 0) return 0;

    const prisma = tx ?? this.prisma;

    // Mapeamos os dados para garantir que campos opcionais tenham valores padrão
    // e que os Decimais estejam formatados corretamente para o Prisma
    const snapshotsToInsert = data.map((item) => ({
      bankrollId: item.bankrollId,
      year: item.year,
      week: item.week,
      balance: new Decimal(item.balance),
      unidValue: new Decimal(item.unidValue),
      weeklyProfit: new Decimal(item.weeklyProfit),
      weeklyROI: new Decimal(item.weeklyROI),
      unitsChange: new Decimal(item.unitsChange),
      peakBalance: new Decimal(item.peakBalance),
      maxDrawdown: new Decimal(item.maxDrawdown),
      drawdownPercent: new Decimal(item.drawdownPercent),
      betsPlaced: item.betsPlaced ?? 0,
      betsWon: item.betsWon ?? 0,
      betsLost: item.betsLost ?? 0,
      winRate: new Decimal(item.winRate ?? 0),
    }));

    const result = await prisma.weeklySnapshot.createMany({
      data: snapshotsToInsert,
      skipDuplicates: true,
    });

    return result.count;
  }

  // READ
  async getSnapshotsByBankroll(
    bankrollId: number,
    userId: number,
  ): Promise<GetWeeklySnapshotDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshots = await this.prisma.weeklySnapshot.findMany({
      where: { bankrollId },
      orderBy: [{ year: 'desc' }, { week: 'desc' }],
    });

    return snapshots as unknown as GetWeeklySnapshotDTO[];
  }

  async getSnapshotByWeek(
    bankrollId: number,
    year: number,
    week: number,
    userId: number,
  ): Promise<GetWeeklySnapshotDTO> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshot = await this.prisma.weeklySnapshot.findUnique({
      where: {
        bankrollId_year_week: {
          bankrollId,
          year,
          week,
        },
      },
    });

    if (!snapshot) {
      throw new NotFoundException(
        `Snapshot para semana ${week}/${year} não encontrado`,
      );
    }

    return this.mapToGetWeeklySnapshotDTO(snapshot);
  }

  async getSnapshotsByYear(
    bankrollId: number,
    year: number,
    userId: number,
  ): Promise<GetWeeklySnapshotDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshots = await this.prisma.weeklySnapshot.findMany({
      where: {
        bankrollId,
        year,
      },
      orderBy: { week: 'desc' },
    });

    return snapshots.map((snapshot) =>
      this.mapToGetWeeklySnapshotDTO(snapshot),
    );
  }

  async getSnapshotById(
    snapshotId: number,
    userId: number,
  ): Promise<GetWeeklySnapshotDTO> {
    return this.findSnapshotOrFail(snapshotId, userId);
  }

  async getLatestSnapshot(
    bankrollId: number,
    userId: number,
  ): Promise<GetWeeklySnapshotDTO | null> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const snapshot = await this.prisma.weeklySnapshot.findFirst({
      where: { bankrollId },
      orderBy: [{ year: 'desc' }, { week: 'desc' }],
    });

    return snapshot ? this.mapToGetWeeklySnapshotDTO(snapshot) : null;
  }

  // UPDATE
  async updateSnapshot(
    snapshotId: number,
    data: Partial<CreateWeeklySnapshotDTO>,
    userId: number,
  ): Promise<GetWeeklySnapshotDTO> {
    await this.findSnapshotOrFail(snapshotId, userId);

    const updateData: Prisma.WeeklySnapshotUpdateInput = {};

    if (data.balance !== undefined)
      updateData.balance = new Decimal(data.balance);
    if (data.unidValue !== undefined)
      updateData.unidValue = new Decimal(data.unidValue);
    if (data.weeklyProfit !== undefined)
      updateData.weeklyProfit = new Decimal(data.weeklyProfit);
    if (data.weeklyROI !== undefined)
      updateData.weeklyROI = new Decimal(data.weeklyROI);
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

    const updated = await this.prisma.weeklySnapshot.update({
      where: { id: snapshotId },
      data: updateData,
    });

    return this.mapToGetWeeklySnapshotDTO(updated);
  }

  // DELETE
  async deleteSnapshot(snapshotId: number, userId: number): Promise<void> {
    await this.findSnapshotOrFail(snapshotId, userId);

    await this.prisma.weeklySnapshot.delete({
      where: { id: snapshotId },
    });
  }

  async deleteSnapshotsByYear(
    bankrollId: number,
    year: number,
    userId: number,
  ): Promise<number> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const result = await this.prisma.weeklySnapshot.deleteMany({
      where: {
        bankrollId,
        year,
      },
    });

    return result.count;
  }

  private mapToGetWeeklySnapshotDTO(
    snapshot: WeeklySnapshot,
  ): GetWeeklySnapshotDTO {
    return {
      id: snapshot.id,
      bankrollId: snapshot.bankrollId,
      year: snapshot.year,
      week: snapshot.week,

      balance: snapshot.balance,
      unidValue: snapshot.unidValue,

      weeklyProfit: snapshot.weeklyProfit,
      weeklyROI: snapshot.weeklyROI,
      unitsChange: snapshot.unitsChange,

      peakBalance: snapshot.peakBalance,
      maxDrawdown: snapshot.maxDrawdown,
      drawdownPercent: snapshot.drawdownPercent,

      betsPlaced: snapshot.betsPlaced,
      betsWon: snapshot.betsWon,
      betsLost: snapshot.betsLost,
      winRate: snapshot.winRate,

      createdAt: snapshot.createdAt,
    };
  }
}
