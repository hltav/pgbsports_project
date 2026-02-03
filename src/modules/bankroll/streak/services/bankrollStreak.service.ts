import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService, Decimal } from '../../../../libs/database';
import {
  CreateBankrollStreakDTO,
  GetBankrollStreakDTO,
} from '../dto/streak.dto';

@Injectable()
export class BankrollStreakService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // HELPERS
  // ============================================

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

  private async findStreakOrFail(
    id: number,
    userId: number,
  ): Promise<GetBankrollStreakDTO> {
    const streak = await this.prisma.bankrollStreak.findUnique({
      where: { id },
      include: { bankroll: true },
    });

    if (!streak) {
      throw new NotFoundException(`Streak ${id} não encontrada`);
    }

    if (streak.bankroll.userId !== userId) {
      throw new ForbiddenException('Acesso negado a esta streak');
    }

    return streak as GetBankrollStreakDTO;
  }

  // ============================================
  // CREATE
  // ============================================

  async create(
    data: CreateBankrollStreakDTO,
    userId: number,
  ): Promise<GetBankrollStreakDTO> {
    await this.validateBankrollOwnership(data.bankrollId, userId);

    const created = await this.prisma.bankrollStreak.create({
      data: {
        bankrollId: data.bankrollId,
        type: data.type,
        length: data.length,
        startDate: data.startDate,
        endDate: data.endDate,
        totalProfit: new Decimal(data.totalProfit),
        totalROI: new Decimal(data.totalROI),
      },
    });

    return created as GetBankrollStreakDTO;
  }

  // ============================================
  // READ
  // ============================================

  async findById(id: number, userId: number): Promise<GetBankrollStreakDTO> {
    return this.findStreakOrFail(id, userId);
  }

  async findAllByBankroll(
    bankrollId: number,
    userId: number,
  ): Promise<GetBankrollStreakDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const streaks = await this.prisma.bankrollStreak.findMany({
      where: { bankrollId },
      orderBy: { createdAt: 'desc' },
    });

    return streaks as GetBankrollStreakDTO[];
  }

  async findByType(
    bankrollId: number,
    type: string,
    userId: number,
  ): Promise<GetBankrollStreakDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const streaks = await this.prisma.bankrollStreak.findMany({
      where: {
        bankrollId,
        type,
      },
      orderBy: { length: 'desc' },
    });

    return streaks as GetBankrollStreakDTO[];
  }

  async findLongestStreak(
    bankrollId: number,
    type: string,
    userId: number,
  ): Promise<GetBankrollStreakDTO | null> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const streak = await this.prisma.bankrollStreak.findFirst({
      where: {
        bankrollId,
        type,
      },
      orderBy: { length: 'desc' },
    });

    return streak as GetBankrollStreakDTO | null;
  }

  // ============================================
  // DELETE
  // ============================================

  async delete(id: number, userId: number): Promise<void> {
    await this.findStreakOrFail(id, userId);

    await this.prisma.bankrollStreak.delete({
      where: { id },
    });
  }

  async deleteByBankroll(bankrollId: number, userId: number): Promise<number> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const result = await this.prisma.bankrollStreak.deleteMany({
      where: { bankrollId },
    });

    return result.count;
  }
}
