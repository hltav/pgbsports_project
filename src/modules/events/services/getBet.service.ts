import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database';
import { $Enums, Bets } from '@prisma/client';

@Injectable()
export class GetBetService {
  constructor(private prisma: PrismaService) {}

  async getBetById(id: number): Promise<Bets> {
    const bet = await this.prisma.bets.findUnique({
      where: { id },
    });

    if (!bet) {
      throw new NotFoundException(`Bet with ID ${id} not found`);
    }

    return bet;
  }

  async getBetsByUser(userId: number): Promise<Bets[]> {
    return await this.prisma.bets.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBetsByBankroll(bankrollId: number): Promise<Bets[]> {
    return await this.prisma.bets.findMany({
      where: { bankrollId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBetsWithFilters(filters: {
    userId?: number;
    bankrollId?: number;
    result?: $Enums.Result;
    sport?: string;
  }): Promise<Bets[]> {
    return await this.prisma.bets.findMany({
      where: {
        userId: filters.userId,
        bankrollId: filters.bankrollId,
        result: filters.result,
        sport: filters.sport,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
