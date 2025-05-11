import { NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database/prisma/prisma.service';
import { GetBankrollDTO } from './../../../libs/common/dto/bankroll/get-bankroll.dto';

export class FindBankrollService {
  constructor(private prisma: PrismaService) {}

  async findAllBankrolls(): Promise<GetBankrollDTO[]> {
    const bankrolls = await this.prisma.bankroll.findMany({
      select: {
        id: true,
        userId: true,
        name: true,
        balance: true,
        bookmaker: true,
        statusSync: true,
      },
    });

    return bankrolls.map((b) => ({
      id: b.id ?? 0,
      userId: b.userId,
      name: b.name,
      balance: b.balance,
      unidValue: b.balance,
      bookmaker: b.bookmaker,
      statusSync: b.statusSync,
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
        bookmaker: true,
        statusSync: true,
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
        bookmaker: true,
        statusSync: true,
      },
    });

    if (bankrolls.length === 0) {
      throw new NotFoundException('No bankroll found for this user!');
    }

    return bankrolls;
  }

  async findBankrollByName(name: string): Promise<GetBankrollDTO | null> {
    return this.prisma.bankroll.findFirst({
      where: { name },
    });
  }
}
