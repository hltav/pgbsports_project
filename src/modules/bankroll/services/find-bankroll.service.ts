// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from './../../../libs/database/prisma/prisma.service';
// import { GetBankrollDTO } from '../z.dto';
// import { Decimal } from '@prisma/client/runtime/library';

// // Tipo para o retorno do Prisma
// type PrismaBankrollWithHistory = {
//   id: number;
//   userId: number;
//   name: string;
//   balance: Decimal;
//   unidValue: Decimal;
//   bookmaker: string;
//   initialBalance: Decimal;
//   histories: Array<{
//     id: number;
//     bankrollId: number;
//     balance: Decimal;
//     unidValue: Decimal;
//     addedBalance: Decimal;
//     withdrawals: Decimal;
//     gains: Decimal;
//     losses: Decimal;
//     profitAndLoss: Decimal;
//     result: Decimal;
//     date: Date;
//   }>;
// };

// @Injectable()
// export class FindBankrollService {
//   constructor(private prisma: PrismaService) {}

//   private readonly defaultSelect = {
//     id: true,
//     userId: true,
//     name: true,
//     balance: true,
//     unidValue: true,
//     bookmaker: true,
//     initialBalance: true,
//     histories: {
//       take: 1,
//       orderBy: {
//         date: 'desc' as const,
//       },
//       select: {
//         id: true,
//         bankrollId: true,
//         balance: true,
//         unidValue: true,
//         addedBalance: true,
//         withdrawals: true,
//         gains: true,
//         losses: true,
//         profitAndLoss: true,
//         result: true,
//         date: true,
//       },
//     },
//   };

//    private formatBankroll = (
//     bankroll: PrismaBankrollWithHistory,
//   ): GetBankrollDTO => {
//     const roundDecimal = (value: Decimal) => value.toDecimalPlaces(2);

//     const lastHistory =
//       bankroll.histories.length > 0
//         ? {
//             ...bankroll.histories[0],
//             balance: roundDecimal(bankroll.histories[0].balance),
//             unidValue: roundDecimal(bankroll.histories[0].unidValue),
//             addedBalance: roundDecimal(bankroll.histories[0].addedBalance),
//             withdrawals: roundDecimal(bankroll.histories[0].withdrawals),
//             gains: roundDecimal(bankroll.histories[0].gains),
//             losses: roundDecimal(bankroll.histories[0].losses),
//             profitAndLoss: roundDecimal(bankroll.histories[0].profitAndLoss),
//             result: roundDecimal(bankroll.histories[0].result),
//             deposits: roundDecimal(bankroll.histories[0].addedBalance),
//           }
//         : undefined;

//     return {
//       id: bankroll.id,
//       userId: bankroll.userId,
//       name: bankroll.name,
//       balance: roundDecimal(bankroll.balance),
//       unidValue: roundDecimal(bankroll.unidValue),
//       initialBalance: roundDecimal(bankroll.initialBalance),
//       bookmaker: bankroll.bookmaker,
//       lastHistory,
//     };
//   };

//   async findAllBankrolls(): Promise<GetBankrollDTO[]> {
//     const bankrolls = await this.prisma.bankroll.findMany({
//       select: this.defaultSelect,
//     });

//     return bankrolls.map(this.formatBankroll);
//   }

//   async findBankrollById(id: number): Promise<GetBankrollDTO> {
//     const bankroll = await this.prisma.bankroll.findUnique({
//       where: { id },
//       select: this.defaultSelect,
//     });

//     if (!bankroll) {
//       throw new NotFoundException('Bankroll not found!');
//     }

//     return this.formatBankroll(bankroll);
//   }

//   async findBankrollsByUserId(userId: number): Promise<GetBankrollDTO[]> {
//     const bankrolls = await this.prisma.bankroll.findMany({
//       where: { userId },
//       select: this.defaultSelect,
//     });

//     if (bankrolls.length === 0) {
//       throw new NotFoundException('No bankroll found for this user!');
//     }

//     return bankrolls.map(this.formatBankroll);
//   }

//   async findBankrollByName(name: string): Promise<GetBankrollDTO | null> {
//     const bankroll = await this.prisma.bankroll.findFirst({
//       where: { name },
//       select: this.defaultSelect,
//     });

//     if (!bankroll) {
//       return null;
//     }

//     return this.formatBankroll(bankroll);
//   }
// }

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database/prisma/prisma.service';
import { GetBankrollDTO, GetBankrollHistoryDTO } from '../z.dto';
import { Decimal } from '@prisma/client/runtime/library';

type BankrollWithHistory = GetBankrollDTO & {
  histories: GetBankrollHistoryDTO[];
  history?: GetBankrollHistoryDTO[];
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
        unidValue: true,
        amount: true,
        eventId: true,
        eventName: true,
        stake: true,
        odds: true,
        potentialWin: true,
        actualReturn: true,
        unidValueBefore: true,
        unidValueAfter: true,
        description: true,
        date: true,
      },
    },
  };

  private roundDecimal = (
    value: Decimal | null | undefined,
  ): Decimal | null => {
    if (!value) return null;
    return value.toDecimalPlaces(2);
  };

  private formatBankroll(bankroll: BankrollWithHistory): GetBankrollDTO {
    const round = this.roundDecimal;

    const safeDecimal = (value: unknown): Decimal | null => {
      if (value instanceof Decimal) return value;
      if (typeof value === 'number' || typeof value === 'string') {
        try {
          return new Decimal(value);
        } catch {
          return null;
        }
      }
      return null;
    };

    const firstHistory = bankroll.histories[0];

    const lastHistory = firstHistory
      ? {
          id: firstHistory.id,
          bankrollId: firstHistory.bankrollId,
          type: firstHistory.type,
          balanceBefore: round(safeDecimal(firstHistory.balanceBefore))!,
          balanceAfter: round(safeDecimal(firstHistory.balanceAfter))!,
          unidValue: round(safeDecimal(firstHistory.unidValue))!,
          amount: round(safeDecimal(firstHistory.amount)) ?? undefined,
          eventId: firstHistory.eventId ?? undefined,
          eventName: firstHistory.eventName ?? undefined,
          stake: round(safeDecimal(firstHistory.stake)) ?? undefined,
          odds: round(safeDecimal(firstHistory.odds)) ?? undefined,
          potentialWin:
            round(safeDecimal(firstHistory.potentialWin)) ?? undefined,
          actualReturn:
            round(safeDecimal(firstHistory.actualReturn)) ?? undefined,
          unidValueBefore:
            round(safeDecimal(firstHistory.unidValueBefore)) ?? undefined,
          unidValueAfter:
            round(safeDecimal(firstHistory.unidValueAfter)) ?? undefined,
          description: firstHistory.description ?? undefined,
          date: firstHistory.date,
        }
      : undefined;

    const bankrollReturn = {
      id: bankroll.id,
      userId: bankroll.userId,
      name: bankroll.name,
      balance: round(safeDecimal(bankroll.balance))!,
      unidValue: round(safeDecimal(bankroll.unidValue))!,
      initialBalance: round(safeDecimal(bankroll.initialBalance))!,
      bookmaker: bankroll.bookmaker,
      totalDeposited: round(safeDecimal(bankroll.totalDeposited))!,
      totalWithdrawn: round(safeDecimal(bankroll.totalWithdrawn))!,
      totalStaked: round(safeDecimal(bankroll.totalStaked))!,
      totalReturned: round(safeDecimal(bankroll.totalReturned))!,
      lastHistory,
    };

    const histories = bankroll.histories.map((h) => ({
      ...h,
      id: h.id,
      bankrollId: h.bankrollId,
      type: h.type,
      balanceBefore: round(safeDecimal(h.balanceBefore))!,
      balanceAfter: round(safeDecimal(h.balanceAfter))!,
      unidValue: round(safeDecimal(h.unidValue))!,
      amount: round(safeDecimal(h.amount)) ?? undefined,
      eventId: h.eventId ?? undefined,
      eventName: h.eventName ?? undefined,
      stake: round(safeDecimal(h.stake)) ?? undefined,
      odds: round(safeDecimal(h.odds)) ?? undefined,
      potentialWin: round(safeDecimal(h.potentialWin)) ?? undefined,
      actualReturn: round(safeDecimal(h.actualReturn)) ?? undefined,
      unidValueBefore: round(safeDecimal(h.unidValueBefore)) ?? undefined,
      unidValueAfter: round(safeDecimal(h.unidValueAfter)) ?? undefined,
      description: h.description ?? undefined,
      date: h.date,
    }));

    return {
      ...bankrollReturn,
      histories,
    };
  }

  async findAllBankrolls(): Promise<GetBankrollDTO[]> {
    const bankrolls = await this.prisma.bankroll.findMany({
      select: this.defaultSelect,
    });

    return bankrolls.map((b) => this.formatBankroll(b as BankrollWithHistory));
  }

  async findBankrollById(id: number): Promise<GetBankrollDTO> {
    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id },
      select: this.defaultSelect,
    });

    if (!bankroll) throw new NotFoundException('Bankroll not found!');

    return this.formatBankroll(bankroll as BankrollWithHistory);
  }

  // ✅ Buscar todas as bancas de um usuário
  async findBankrollsByUserId(userId: number): Promise<GetBankrollDTO[]> {
    const bankrolls = await this.prisma.bankroll.findMany({
      where: { userId },
      select: this.defaultSelect,
    });

    if (bankrolls.length === 0) {
      throw new NotFoundException('No bankroll found for this user!');
    }

    return bankrolls.map((b) => this.formatBankroll(b as BankrollWithHistory));
  }

  // ✅ Buscar por nome
  async findBankrollByName(name: string): Promise<GetBankrollDTO | null> {
    const bankroll = await this.prisma.bankroll.findFirst({
      where: { name },
      select: this.defaultSelect,
    });

    if (!bankroll) return null;

    return this.formatBankroll(bankroll as BankrollWithHistory);
  }
}
