import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../../libs/database';
import { GetBankrollHistoryDTO } from '../../z.dto';
import { BankrollHistoryResponseMapper } from '../mapper/bankrollHistory.mapper';

@Injectable()
export class FindBankrollHistoryService {
  constructor(private prisma: PrismaService) {}

  private readonly defaultInclude = {
    bets: {
      select: {
        eventDescription: true,
        stake: true,
        odd: true,
        potentialReturn: true,
        actualReturn: true,
      },
    },
  };

  async findByBankrollId(bankrollId: number): Promise<GetBankrollHistoryDTO[]> {
    const histories = await this.prisma.bankrollHistory.findMany({
      where: { bankrollId },
      orderBy: { date: 'asc' },
      include: this.defaultInclude,
    });

    if (!histories || histories.length === 0) {
      throw new NotFoundException(
        `Nenhum histórico encontrado para a banca ID ${bankrollId}`,
      );
    }

    return histories.map((h) => BankrollHistoryResponseMapper.toDTO(h));
  }

  async findLastByBankrollId(
    bankrollId: number,
  ): Promise<GetBankrollHistoryDTO | null> {
    const lastHistory = await this.prisma.bankrollHistory.findFirst({
      where: { bankrollId },
      orderBy: { date: 'desc' },
      include: this.defaultInclude,
    });

    if (!lastHistory) return null;

    return BankrollHistoryResponseMapper.toDTO(lastHistory);
  }

  async findByType(
    bankrollId: number,
    type:
      | 'DEPOSIT'
      | 'WITHDRAWAL'
      | 'BET_PLACED'
      | 'BET_WIN'
      | 'BET_LOSS'
      | 'BET_VOID'
      | 'UNID_VALUE_CHANGE'
      | 'BALANCE_ADJUSTMENT',
  ): Promise<GetBankrollHistoryDTO[]> {
    const histories = await this.prisma.bankrollHistory.findMany({
      where: {
        bankrollId,
        type,
      },
      orderBy: { date: 'desc' },
      include: this.defaultInclude,
    });

    return histories.map((h) => BankrollHistoryResponseMapper.toDTO(h));
  }

  async findTransactions(bankrollId: number): Promise<GetBankrollHistoryDTO[]> {
    const transactions = await this.prisma.bankrollHistory.findMany({
      where: {
        bankrollId,
        type: {
          in: ['DEPOSIT', 'WITHDRAWAL'],
        },
      },
      orderBy: { date: 'desc' },
      include: this.defaultInclude,
    });

    return transactions.map((h) => BankrollHistoryResponseMapper.toDTO(h));
  }

  async findBets(bankrollId: number): Promise<GetBankrollHistoryDTO[]> {
    const bets = await this.prisma.bankrollHistory.findMany({
      where: {
        bankrollId,
        type: {
          in: ['BET_PLACED', 'BET_WIN', 'BET_LOSS', 'BET_VOID'],
        },
      },
      orderBy: { date: 'desc' },
      include: this.defaultInclude,
    });

    return bets.map((h) => BankrollHistoryResponseMapper.toDTO(h));
  }
}
