import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../../libs/database';
import { GetBankrollDTO, GetBankrollHistoryDTO } from '../../z.dto';
import { BankrollResponseMapper } from '../mapper/bankrollResponse.mapper';

type BankrollWithHistory = GetBankrollDTO & {
  histories: GetBankrollHistoryDTO[];
};

@Injectable()
export class FindBankrollService {
  constructor(private prisma: PrismaService) {}

  private readonly defaultSelect = {
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
    histories: {
      orderBy: { date: 'desc' as const },
      select: {
        id: true,
        bankrollId: true,
        type: true,
        balanceBefore: true,
        balanceAfter: true,
        amount: true,
        unidValueBefore: true,
        unidValueAfter: true,
        betId: true,
        description: true,
        date: true,
        bets: {
          select: {
            eventDescription: true,
            stake: true,
            odd: true,
            potentialReturn: true,
            actualReturn: true,
          },
        },
      },
    },
  };

  async findAllBankrolls(): Promise<GetBankrollDTO[]> {
    const bankrolls = await this.prisma.bankroll.findMany({
      select: this.defaultSelect,
    });

    return bankrolls.map((b) => BankrollResponseMapper.toDTO(b));
  }

  async findBankrollById(id: number, userId: number): Promise<GetBankrollDTO> {
    const bankroll = await this.prisma.bankroll.findFirst({
      where: { id, userId },
      select: this.defaultSelect,
    });

    if (!bankroll) {
      throw new NotFoundException('Bankroll not found or access denied!');
    }

    return BankrollResponseMapper.toDTO(bankroll as BankrollWithHistory);
  }

  async findBankrollsByUserId(userId: number): Promise<GetBankrollDTO[]> {
    const bankrolls = await this.prisma.bankroll.findMany({
      where: { userId },
      select: this.defaultSelect,
    });

    return bankrolls.map((b) => BankrollResponseMapper.toDTO(b));
  }

  async findBankrollByName(name: string): Promise<GetBankrollDTO | null> {
    const bankroll = await this.prisma.bankroll.findFirst({
      where: { name },
      select: this.defaultSelect,
    });

    return bankroll
      ? BankrollResponseMapper.toDTO(bankroll as BankrollWithHistory)
      : null;
  }
}
