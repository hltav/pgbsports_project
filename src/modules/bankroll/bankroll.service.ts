import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from './../../libs/database/prisma';
import {
  GetBankrollDTO,
  CreateBankrollDTO,
  UpdateBankrollDTO,
} from './../../libs/common/dto/bankroll';

@Injectable()
export class BankrollService {
  constructor(private prisma: PrismaService) {}

  async findAllBankrolls(): Promise<GetBankrollDTO[]> {
    const bankrolls = await this.prisma.bankroll.findMany({
      select: {
        id: true,
        userId: true,
        name: true,
        balance: true,
      },
    });

    return bankrolls.map((b) => ({
      id: b.id ?? 0,
      userId: b.userId,
      name: b.name,
      balance: b.balance,
      unidValue: b.balance,
    }));
  }

  async findBankrollById(id: number): Promise<GetBankrollDTO> {
    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        name: true,
        balance: true,
        unidValue: true,
      },
    });

    if (!bankroll) {
      throw new NotFoundException('Bankroll not found!');
    }

    return bankroll;
  }

  async findBankrollsByUserId(userId: number): Promise<GetBankrollDTO[]> {
    const bankrolls = await this.prisma.bankroll.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        name: true,
        balance: true,
        unidValue: true,
      },
    });

    if (bankrolls.length === 0) {
      throw new NotFoundException(
        'Nenhuma banca encontrada para este usuário!',
      );
    }

    return bankrolls;
  }

  async findBankrollByName(name: string): Promise<GetBankrollDTO | null> {
    return this.prisma.bankroll.findFirst({
      where: { name },
    });
  }

  async createBankroll(data: CreateBankrollDTO): Promise<GetBankrollDTO> {
    const existingBankroll = await this.prisma.bankroll.findFirst({
      where: { name: data.name },
    });

    if (existingBankroll) {
      throw new ConflictException('Bankroll with this name already exists!');
    }

    return this.prisma.bankroll.create({
      data: {
        name: data.name,
        userId: data.userId,
        balance: data.balance,
        unidValue: data.unidValue,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        balance: true,
        unidValue: true,
      },
    });
  }

  async updateBankroll(
    id: number,
    updateData: Partial<UpdateBankrollDTO>,
  ): Promise<GetBankrollDTO> {
    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id },
    });

    if (!bankroll) {
      throw new NotFoundException('Bankroll not found!');
    }

    return this.prisma.bankroll.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        userId: true,
        name: true,
        balance: true,
        unidValue: true,
      },
    });
  }

  async deleteBankroll(id: number): Promise<GetBankrollDTO> {
    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id },
    });

    if (!bankroll) {
      throw new NotFoundException('Bankroll not found!');
    }

    await this.prisma.bankroll.delete({
      where: { id },
    });

    return bankroll;
  }
}
