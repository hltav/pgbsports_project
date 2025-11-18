// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from './../../../libs/database/prisma/prisma.service';
// import { GetBankrollHistoryDTO } from '../z.dto/createHistories.dto';

// @Injectable()
// export class FindBankrollHistoryService {
//   constructor(private prisma: PrismaService) {}

//   // 🔹 Busca todo o histórico de uma banca específica
//   async findByBankrollId(bankrollId: number): Promise<GetBankrollHistoryDTO[]> {
//     const histories = await this.prisma.bankrollHistory.findMany({
//       where: { bankrollId },
//       orderBy: { date: 'asc' },
//     });

//     if (!histories || histories.length === 0) {
//       throw new NotFoundException(
//         `Nenhum histórico encontrado para a banca ID ${bankrollId}`,
//       );
//     }

//     return histories.map((history) => ({
//       id: history.id,
//       bankrollId: history.bankrollId,
//       date: history.date,
//       balance: history.balance,
//       unidValue: history.unidValue,
//       deposits: history.addedBalance,
//       withdrawals: history.withdrawals,
//       addedBalance: history.addedBalance,
//       gains: history.gains,
//       losses: history.losses,
//       profitAndLoss: history.profitAndLoss,
//       result: history.result,
//     }));
//   }

//   // 🔹 (opcional) Busca o histórico mais recente de uma banca
//   async findLastByBankrollId(
//     bankrollId: number,
//   ): Promise<GetBankrollHistoryDTO | null> {
//     const lastHistory = await this.prisma.bankrollHistory.findFirst({
//       where: { bankrollId },
//       orderBy: { date: 'desc' },
//     });

//     if (!lastHistory) return null;

//     return {
//       id: lastHistory.id,
//       bankrollId: lastHistory.bankrollId,
//       date: lastHistory.date,
//       balance: lastHistory.balance,
//       unidValue: lastHistory.unidValue,
//       deposits: lastHistory.addedBalance,
//       withdrawals: lastHistory.withdrawals,
//       addedBalance: lastHistory.addedBalance,
//       gains: lastHistory.gains,
//       losses: lastHistory.losses,
//       profitAndLoss: lastHistory.profitAndLoss,
//       result: lastHistory.result,
//     };
//   }
// }

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database/prisma/prisma.service';
import { GetBankrollHistoryDTO } from '../z.dto/createHistories.dto';
import { BankrollHistoryDTO } from '../z.dto/bankrollHistory.dto';

@Injectable()
export class FindBankrollHistoryService {
  constructor(private prisma: PrismaService) {}

  private mapHistoryToDTO(history: BankrollHistoryDTO): GetBankrollHistoryDTO {
    return {
      id: history.id,
      bankrollId: history.bankrollId,
      date: history.date,
      type: history.type as GetBankrollHistoryDTO['type'],
      balanceBefore: history.balanceBefore,
      balanceAfter: history.balanceAfter,
      unidValue: history.unidValue,
      amount: history.amount ?? undefined,
      stake: history.stake ?? undefined,
      odds: history.odds ?? undefined,
      potentialWin: history.potentialWin ?? undefined,
      actualReturn: history.actualReturn ?? undefined,
      unidValueBefore: history.unidValueBefore ?? undefined,
      unidValueAfter: history.unidValueAfter ?? undefined,
      eventId: history.eventId ?? undefined,
      eventName: history.eventName ?? undefined,
      description: history.description ?? undefined,
    };
  }

  async findByBankrollId(bankrollId: number): Promise<GetBankrollHistoryDTO[]> {
    const histories = await this.prisma.bankrollHistory.findMany({
      where: { bankrollId },
      orderBy: { date: 'asc' },
    });

    if (!histories || histories.length === 0) {
      throw new NotFoundException(
        `Nenhum histórico encontrado para a banca ID ${bankrollId}`,
      );
    }

    return histories.map((history) => this.mapHistoryToDTO(history));
  }

  // 🔹 Busca o histórico mais recente de uma banca
  async findLastByBankrollId(
    bankrollId: number,
  ): Promise<GetBankrollHistoryDTO | null> {
    const lastHistory = await this.prisma.bankrollHistory.findFirst({
      where: { bankrollId },
      orderBy: { date: 'desc' },
    });

    if (!lastHistory) return null;

    return this.mapHistoryToDTO(lastHistory);
  }

  // 🔹 Busca histórico por tipo (útil para análises)
  async findByType(
    bankrollId: number,
    type:
      | 'DEPOSIT'
      | 'WITHDRAWAL'
      | 'BET_PLACED'
      | 'BET_WON'
      | 'BET_LOST'
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
    });

    return histories.map((history) => this.mapHistoryToDTO(history));
  }

  // 🔹 Busca histórico de transações financeiras (depósitos + saques)
  async findTransactions(bankrollId: number): Promise<GetBankrollHistoryDTO[]> {
    const transactions = await this.prisma.bankrollHistory.findMany({
      where: {
        bankrollId,
        type: {
          in: ['DEPOSIT', 'WITHDRAWAL'],
        },
      },
      orderBy: { date: 'desc' },
    });

    return transactions.map((history) => this.mapHistoryToDTO(history));
  }

  // 🔹 Busca histórico de apostas
  async findBets(bankrollId: number): Promise<GetBankrollHistoryDTO[]> {
    const bets = await this.prisma.bankrollHistory.findMany({
      where: {
        bankrollId,
        type: {
          in: ['BET_PLACED', 'BET_WON', 'BET_LOST', 'BET_VOID'],
        },
      },
      orderBy: { date: 'desc' },
    });

    return bets.map((history) => this.mapHistoryToDTO(history));
  }
}
