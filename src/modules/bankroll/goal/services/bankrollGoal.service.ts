import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService, Decimal } from '../../../../libs/database';
import {
  GetBankrollGoalDTO,
  CreateBankrollGoalDTO,
  UpdateBankrollGoalDTO,
} from '../dto/goal.dto';

@Injectable()
export class BankrollGoalService {
  constructor(private readonly prisma: PrismaService) {}

  // HELPERS
  /** Remove keys com undefined para updates parciais */
  private clean<T extends object>(obj: T): T {
    return Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== undefined),
    ) as T;
  }

  /** Busca meta e valida ownership do usuário automaticamente */
  private async findGoalOrFail(goalId: number, userId: number) {
    const goal = await this.prisma.bankrollGoal.findUnique({
      where: { id: goalId },
      include: { bankroll: true },
    });

    if (!goal) {
      throw new NotFoundException(`Meta ${goalId} não encontrada`);
    }

    if (goal.bankroll.userId !== userId) {
      throw new ForbiddenException('Acesso negado a esta meta');
    }

    return goal as GetBankrollGoalDTO;
  }

  /** Valida que o bankroll pertence ao user */
  private async validateBankrollOwnership(bankrollId: number, userId: number) {
    const bank = await this.prisma.bankroll.findUnique({
      where: { id: bankrollId },
    });

    if (!bank)
      throw new NotFoundException(`Bankroll ${bankrollId} não encontrado`);
    if (bank.userId !== userId)
      throw new ForbiddenException('Acesso negado a este bankroll');
  }

  // CREATE
  async createGoal(
    data: CreateBankrollGoalDTO,
    userId: number,
  ): Promise<GetBankrollGoalDTO> {
    await this.validateBankrollOwnership(data.bankrollId, userId);

    const goal = await this.prisma.bankrollGoal.create({
      data: {
        ...data,
        targetProfit: new Decimal(data.targetProfit),
        currentValue: new Decimal(data.currentValue ?? 0),
      },
    });

    return goal as GetBankrollGoalDTO;
  }

  // READ
  async getGoalsByBankroll(
    bankrollId: number,
    userId: number,
  ): Promise<GetBankrollGoalDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const goals = await this.prisma.bankrollGoal.findMany({
      where: { bankrollId },
      orderBy: { createdAt: 'desc' },
    });

    return goals as GetBankrollGoalDTO[];
  }

  async getActiveGoals(
    bankrollId: number,
    userId: number,
  ): Promise<GetBankrollGoalDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const goals = await this.prisma.bankrollGoal.findMany({
      where: { bankrollId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return goals as GetBankrollGoalDTO[];
  }

  async getGoalById(
    goalId: number,
    userId: number,
  ): Promise<GetBankrollGoalDTO> {
    return this.findGoalOrFail(goalId, userId);
  }

  // UPDATE
  async updateGoal(
    data: UpdateBankrollGoalDTO,
    userId: number,
  ): Promise<GetBankrollGoalDTO> {
    await this.findGoalOrFail(data.id, userId);

    const updateData = this.clean({
      description: data.description,
      isActive: data.isActive,
      deadline: data.deadline,
      achievedAt: data.achievedAt,
      targetProfit:
        data.targetProfit != null ? new Decimal(data.targetProfit) : undefined,
      currentValue:
        data.currentValue != null ? new Decimal(data.currentValue) : undefined,
    });

    const updated = await this.prisma.bankrollGoal.update({
      where: { id: data.id },
      data: updateData,
    });

    return updated as GetBankrollGoalDTO;
  }

  async achieveGoal(
    goalId: number,
    userId: number,
  ): Promise<GetBankrollGoalDTO> {
    await this.findGoalOrFail(goalId, userId);

    const achieved = await this.prisma.bankrollGoal.update({
      where: { id: goalId },
      data: {
        achievedAt: new Date(),
        isActive: false,
      },
    });

    return achieved as GetBankrollGoalDTO;
  }

  async updateProgress(
    goalId: number,
    currentValue: string | Decimal,
    userId: number,
  ): Promise<GetBankrollGoalDTO> {
    await this.findGoalOrFail(goalId, userId);

    const updated = await this.prisma.bankrollGoal.update({
      where: { id: goalId },
      data: { currentValue: new Decimal(currentValue) },
    });

    // Checagem automática de meta alcançada
    if (!updated.achievedAt && updated.currentValue.gte(updated.targetProfit)) {
      return this.achieveGoal(goalId, userId);
    }

    return updated as GetBankrollGoalDTO;
  }

  // DELETE
  async deleteGoal(goalId: number, userId: number): Promise<void> {
    await this.findGoalOrFail(goalId, userId);

    await this.prisma.bankrollGoal.update({
      where: { id: goalId },
      data: { isActive: false },
    });
  }

  async hardDeleteGoal(goalId: number, userId: number): Promise<void> {
    await this.findGoalOrFail(goalId, userId);

    await this.prisma.bankrollGoal.delete({
      where: { id: goalId },
    });
  }
}
