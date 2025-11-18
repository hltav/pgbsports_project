import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database/prisma/prisma.service';
import { CreateBankrollDTO, GetBankrollDTO } from '../z.dto';

@Injectable()
export class CreateBankrollService {
  constructor(private prisma: PrismaService) {}

  async createBankroll(data: CreateBankrollDTO): Promise<GetBankrollDTO> {
    const existingBankroll = await this.prisma.bankroll.findFirst({
      where: {
        name: data.name,
        userId: data.userId,
      },
    });

    if (existingBankroll) {
      throw new ConflictException('Bankroll with this name already exists!');
    }

    const initialBalance = data.initialBalance ?? data.balance;

    const created = await this.prisma.bankroll.create({
      data: {
        name: data.name,
        userId: data.userId,
        balance: data.balance,
        unidValue: data.unidValue,
        bookmaker: data.bookmaker ?? 'Unknown',
        initialBalance,
        totalDeposited: data.totalDeposited ?? '0',
        totalWithdrawn: data.totalWithdrawn ?? '0',
        totalStaked: data.totalStaked ?? '0',
        totalReturned: data.totalReturned ?? '0',
        histories: {
          create: {
            type: 'BALANCE_ADJUSTMENT',
            balanceBefore: initialBalance,
            balanceAfter: initialBalance,
            unidValue: data.unidValue,
            description: 'Banca criada',
          },
        },
      },
      select: {
        id: true,
        userId: true,
        name: true,
        balance: true,
        unidValue: true,
        bookmaker: true,
        initialBalance: true,
        totalDeposited: true,
        totalWithdrawn: true,
        totalStaked: true,
        totalReturned: true,
      },
    });

    return created;
  }
}
