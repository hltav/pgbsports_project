import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  BankrollCreateDTO,
  BankrollUpdateDTO,
  GetBankrollDTO,
} from './../../libs/common';
import { PrismaService } from './../../libs/database/prisma';

@Injectable()
export class BankrollService {
  constructor(private prisma: PrismaService) {}

  async findAllBankrolls(): Promise<GetBankrollDTO[]> {
    const bankrolls = await this.prisma.bankroll.findMany({
      select: {
        id: true,
        name: true,
        balance: true,
      },
    });

    return bankrolls.map((b) => ({
      id: b.id ?? 0, // Substitui undefined por 0 ou outro valor seguro
      name: b.name,
      balance: b.balance,
    }));
  }

  async findBankrollById(id: number): Promise<GetBankrollDTO> {
    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        balance: true,
      },
    });

    if (!bankroll) {
      throw new NotFoundException('Bankroll not found!');
    }

    return bankroll;
  }

  async findBankrollByName(name: string): Promise<GetBankrollDTO | null> {
    return this.prisma.bankroll.findFirst({
      where: { name },
    });
  }

  async createBankroll(data: BankrollCreateDTO): Promise<GetBankrollDTO> {
    const existingBankroll = await this.prisma.bankroll.findFirst({
      where: { name: data.name },
    });

    if (existingBankroll) {
      throw new ConflictException('Bankroll with this name already exists!');
    }

    return this.prisma.bankroll.create({
      data: {
        name: data.name,
        balance: data.balance,
      },
      select: {
        id: true,
        name: true,
        balance: true,
      },
    });
  }

  async updateBankroll(
    id: number,
    updateData: Partial<BankrollUpdateDTO>,
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
        name: true,
        balance: true,
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
