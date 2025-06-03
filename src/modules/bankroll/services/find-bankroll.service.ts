import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database/prisma/prisma.service';
import { GetBankrollDTO } from '../z.dto';

@Injectable()
export class FindBankrollService {
  constructor(private prisma: PrismaService) {}

  async findAllBankrolls(): Promise<GetBankrollDTO[]> {
    const bankrolls = await this.prisma.bankroll.findMany({
      select: {
        id: true,
        userId: true,
        name: true,
        balance: true,
        unidValue: true,
        bookmaker: true,
      },
    });

    return bankrolls.map((b) => ({
      ...b,
      statusSync: 'Synchronized',
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
      },
    });

    if (!bankroll) {
      throw new NotFoundException('Bankroll not found!');
    }

    return {
      ...bankroll,
      statusSync: 'Synchronized',
    };
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
      },
    });

    if (bankrolls.length === 0) {
      throw new NotFoundException('No bankroll found for this user!');
    }

    return bankrolls.map((b) => ({
      ...b,
      statusSync: 'Synchronized',
    }));
  }

  async findBankrollByName(name: string): Promise<GetBankrollDTO | null> {
    const bankroll = await this.prisma.bankroll.findFirst({
      where: { name },
      select: {
        id: true,
        userId: true,
        name: true,
        balance: true,
        unidValue: true,
        bookmaker: true,
      },
    });

    if (!bankroll) {
      return null;
    }

    return {
      ...bankroll,
      statusSync: 'Synchronized',
    };
  }
}
