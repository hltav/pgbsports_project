// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from './../../../libs/database/prisma/prisma.service';
// import { GetBankrollDTO } from '../z.dto';

// @Injectable()
// export class FindBankrollService {
//   constructor(private prisma: PrismaService) {}

//   async findAllBankrolls(): Promise<GetBankrollDTO[]> {
//     const bankrolls = await this.prisma.bankroll.findMany({
//       select: {
//         id: true,
//         userId: true,
//         name: true,
//         balance: true,
//         unidValue: true,
//         bookmaker: true,
//       },
//     });

//     return bankrolls.map((b) => ({
//       ...b,
//       statusSync: 'Synchronized',
//     }));
//   }

//   async findBankrollById(id: number): Promise<GetBankrollDTO> {
//     const bankroll = await this.prisma.bankroll.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         userId: true,
//         name: true,
//         balance: true,
//         unidValue: true,
//         bookmaker: true,
//       },
//     });

//     if (!bankroll) {
//       throw new NotFoundException('Bankroll not found!');
//     }

//     return {
//       ...bankroll,
//       statusSync: 'Synchronized',
//     };
//   }

//   async findBankrollsByUserId(userId: number): Promise<GetBankrollDTO[]> {
//     const bankrolls = await this.prisma.bankroll.findMany({
//       where: { userId },
//       select: {
//         id: true,
//         userId: true,
//         name: true,
//         balance: true,
//         unidValue: true,
//         bookmaker: true,
//       },
//     });

//     if (bankrolls.length === 0) {
//       throw new NotFoundException('No bankroll found for this user!');
//     }

//     return bankrolls.map((b) => ({
//       ...b,
//       statusSync: 'Synchronized',
//     }));
//   }

//   async findBankrollByName(name: string): Promise<GetBankrollDTO | null> {
//     const bankroll = await this.prisma.bankroll.findFirst({
//       where: { name },
//       select: {
//         id: true,
//         userId: true,
//         name: true,
//         balance: true,
//         unidValue: true,
//         bookmaker: true,
//       },
//     });

//     if (!bankroll) {
//       return null;
//     }

//     return {
//       ...bankroll,
//       statusSync: 'Synchronized',
//     };
//   }
// }

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from './../../../libs/database/prisma/prisma.service';
// import { GetBankrollDTO } from '../z.dto';

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
//   };

//   async findAllBankrolls(): Promise<GetBankrollDTO[]> {
//     const bankrolls = await this.prisma.bankroll.findMany({
//       select: this.defaultSelect,
//     });

//     return bankrolls.map((b) => ({
//       ...b,
//       statusSync: 'Synchronized',
//     }));
//   }

//   async findBankrollById(id: number): Promise<GetBankrollDTO> {
//     const bankroll = await this.prisma.bankroll.findUnique({
//       where: { id },
//       select: this.defaultSelect,
//     });

//     if (!bankroll) {
//       throw new NotFoundException('Bankroll not found!');
//     }

//     return {
//       ...bankroll,
//       statusSync: 'Synchronized',
//     };
//   }

//   async findBankrollsByUserId(userId: number): Promise<GetBankrollDTO[]> {
//     const bankrolls = await this.prisma.bankroll.findMany({
//       where: { userId },
//       select: this.defaultSelect,
//     });

//     if (bankrolls.length === 0) {
//       throw new NotFoundException('No bankroll found for this user!');
//     }

//     return bankrolls.map((b) => ({
//       ...b,
//       statusSync: 'Synchronized',
//     }));
//   }

//   async findBankrollByName(name: string): Promise<GetBankrollDTO | null> {
//     const bankroll = await this.prisma.bankroll.findFirst({
//       where: { name },
//       select: this.defaultSelect,
//     });

//     if (!bankroll) {
//       return null;
//     }

//     return {
//       ...bankroll,
//       statusSync: 'Synchronized',
//     };
//   }
// }

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database/prisma/prisma.service';
import { GetBankrollDTO, GetBankrollHistoryDTO } from '../z.dto';
import { Decimal } from '@prisma/client/runtime/library';

// Tipo para o retorno do Prisma
type PrismaBankrollWithHistory = {
  id: number;
  userId: number;
  name: string;
  balance: Decimal;
  unidValue: Decimal;
  bookmaker: string;
  initialBalance: Decimal;
  histories: Array<{
    id: number;
    bankrollId: number;
    balance: Decimal;
    unidValue: Decimal;
    addedBalance: Decimal;
    withdrawals: Decimal;
    gains: Decimal;
    losses: Decimal;
    profitAndLoss: Decimal;
    result: Decimal;
    date: Date;
  }>;
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
    histories: {
      take: 1,
      orderBy: {
        date: 'desc' as const,
      },
      select: {
        id: true,
        bankrollId: true,
        balance: true,
        unidValue: true,
        addedBalance: true,
        withdrawals: true,
        gains: true,
        losses: true,
        profitAndLoss: true,
        result: true,
        date: true,
      },
    },
  };

  private formatBankroll = (
    bankroll: PrismaBankrollWithHistory,
  ): GetBankrollDTO => {
    const lastHistory: GetBankrollHistoryDTO | undefined =
      bankroll.histories.length > 0
        ? {
            ...bankroll.histories[0],
            deposits: bankroll.histories[0].addedBalance,
          }
        : undefined;

    return {
      id: bankroll.id,
      userId: bankroll.userId,
      name: bankroll.name,
      balance: bankroll.balance,
      unidValue: bankroll.unidValue,
      bookmaker: bankroll.bookmaker,
      initialBalance: bankroll.initialBalance,
      lastHistory,
      statusSync: 'Synchronized' as const,
    };
  };

  async findAllBankrolls(): Promise<GetBankrollDTO[]> {
    const bankrolls = await this.prisma.bankroll.findMany({
      select: this.defaultSelect,
    });

    return bankrolls.map(this.formatBankroll);
  }

  async findBankrollById(id: number): Promise<GetBankrollDTO> {
    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id },
      select: this.defaultSelect,
    });

    if (!bankroll) {
      throw new NotFoundException('Bankroll not found!');
    }

    return this.formatBankroll(bankroll);
  }

  async findBankrollsByUserId(userId: number): Promise<GetBankrollDTO[]> {
    const bankrolls = await this.prisma.bankroll.findMany({
      where: { userId },
      select: this.defaultSelect,
    });

    if (bankrolls.length === 0) {
      throw new NotFoundException('No bankroll found for this user!');
    }

    return bankrolls.map(this.formatBankroll);
  }

  async findBankrollByName(name: string): Promise<GetBankrollDTO | null> {
    const bankroll = await this.prisma.bankroll.findFirst({
      where: { name },
      select: this.defaultSelect,
    });

    if (!bankroll) {
      return null;
    }

    return this.formatBankroll(bankroll);
  }
}
