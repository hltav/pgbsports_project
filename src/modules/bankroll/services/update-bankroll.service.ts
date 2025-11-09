/* eslint-disable @typescript-eslint/no-unused-vars */
// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from './../../../libs/database/prisma';
// import { UpdateBankrollDTO, GetBankrollDTO, PatchBankrollDTO } from '../z.dto';

// @Injectable()
// export class UpdateBankrollService {
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

//   async updateBankroll(
//     id: number,
//     updateData: Partial<UpdateBankrollDTO>,
//   ): Promise<GetBankrollDTO> {
//     const bankroll = await this.prisma.bankroll.findUnique({
//       where: { id },
//     });

//     if (!bankroll) {
//       throw new NotFoundException('Bankroll not found!');
//     }

//     const updatedBankroll = await this.prisma.bankroll.update({
//       where: { id },
//       data: updateData,
//       select: this.defaultSelect,
//     });

//     return {
//       ...updatedBankroll,
//       statusSync: 'Synchronized',
//     };
//   }

//   async patchUpdateBankroll(
//     id: number,
//     patchData: PatchBankrollDTO,
//   ): Promise<GetBankrollDTO> {
//     const bankroll = await this.prisma.bankroll.findUnique({
//       where: { id },
//     });

//     if (!bankroll) {
//       throw new NotFoundException('Bankroll not found!');
//     }

//     const updatedBankroll = await this.prisma.bankroll.update({
//       where: { id },
//       data: {
//         ...patchData,
//       },
//       select: this.defaultSelect,
//     });

//     return {
//       ...updatedBankroll,
//       statusSync: 'Synchronized',
//     };
//   }
// }

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from './../../../libs/database/prisma';
// import { UpdateBankrollDTO, GetBankrollDTO, PatchBankrollDTO } from '../z.dto';
// import { Decimal } from '@prisma/client/runtime/library';

// @Injectable()
// export class UpdateBankrollService {
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

//   private async createHistoryRecord(
//     bankrollId: number,
//     oldBalance: Decimal,
//     newBalance: Decimal,
//     oldUnidValue: Decimal,
//     newUnidValue: Decimal,
//   ) {
//     const balanceDiff = new Decimal(newBalance).minus(oldBalance);

//     // Determina se foi depósito ou saque com base na diferença
//     const addedBalance = balanceDiff.greaterThan(0)
//       ? balanceDiff
//       : new Decimal(0);
//     const withdrawals = balanceDiff.lessThan(0)
//       ? balanceDiff.abs()
//       : new Decimal(0);

//     await this.prisma.bankrollHistory.create({
//       data: {
//         bankrollId,
//         balance: newBalance.toString(),
//         unidValue: newUnidValue.toString(),
//         addedBalance: addedBalance.toString(),
//         withdrawals: withdrawals.toString(),
//         gains: '0',
//         losses: '0',
//         profitAndLoss: '0',
//         result: balanceDiff.toString(),
//       },
//     });
//   }

//   async updateBankroll(
//     id: number,
//     updateData: Partial<UpdateBankrollDTO>,
//   ): Promise<GetBankrollDTO> {
//     const bankroll = await this.prisma.bankroll.findUnique({
//       where: { id },
//     });

//     if (!bankroll) {
//       throw new NotFoundException('Bankroll not found!');
//     }

//     // Salva os valores antigos
//     const oldBalance = bankroll.balance;
//     const oldUnidValue = bankroll.unidValue;

//     const updatedBankroll = await this.prisma.bankroll.update({
//       where: { id },
//       data: updateData,
//       select: this.defaultSelect,
//     });

//     // Cria registro de histórico se balance ou unidValue mudaram
//     if (
//       updateData.balance !== undefined ||
//       updateData.unidValue !== undefined
//     ) {
//       await this.createHistoryRecord(
//         id,
//         oldBalance,
//         updatedBankroll.balance,
//         oldUnidValue,
//         updatedBankroll.unidValue,
//       );
//     }

//     return {
//       ...updatedBankroll,
//       statusSync: 'Synchronized',
//     };
//   }

//   async patchUpdateBankroll(
//     id: number,
//     patchData: PatchBankrollDTO,
//   ): Promise<GetBankrollDTO> {
//     const bankroll = await this.prisma.bankroll.findUnique({
//       where: { id },
//     });

//     if (!bankroll) {
//       throw new NotFoundException('Bankroll not found!');
//     }

//     // Salva os valores antigos
//     const oldBalance = bankroll.balance;
//     const oldUnidValue = bankroll.unidValue;

//     const updatedBankroll = await this.prisma.bankroll.update({
//       where: { id },
//       data: {
//         ...patchData,
//       },
//       select: this.defaultSelect,
//     });

//     // Cria registro de histórico se balance ou unidValue mudaram
//     if (patchData.balance !== undefined || patchData.unidValue !== undefined) {
//       await this.createHistoryRecord(
//         id,
//         oldBalance,
//         updatedBankroll.balance,
//         oldUnidValue,
//         updatedBankroll.unidValue,
//       );
//     }

//     return {
//       ...updatedBankroll,
//       statusSync: 'Synchronized',
//     };
//   }
// }
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database/prisma';
import { UpdateBankrollDTO, GetBankrollDTO, PatchBankrollDTO } from '../z.dto';
import { Decimal } from '@prisma/client/runtime/library';

interface BankrollUpdateData {
  bankrollId: number;
  unitsChange: number;
  monetaryChange: Decimal;
  reason: 'BET_PLACED' | 'BET_WON' | 'BET_LOST' | 'BET_VOID';
}

interface BankrollHistory {
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
}

@Injectable()
export class UpdateBankrollService {
  constructor(private prisma: PrismaService) {}

  private readonly defaultSelect = {
    id: true,
    userId: true,
    name: true,
    balance: true,
    unidValue: true,
    bookmaker: true,
    initialBalance: true,
  };

  private async createHistoryRecord(
    bankrollId: number,
    oldBalance: Decimal,
    newBalance: Decimal,
    oldUnidValue: Decimal,
    newUnidValue: Decimal,
  ) {
    const balanceDiff = new Decimal(newBalance).minus(oldBalance);

    const addedBalance = balanceDiff.greaterThan(0)
      ? balanceDiff
      : new Decimal(0);
    const withdrawals = balanceDiff.lessThan(0)
      ? balanceDiff.abs()
      : new Decimal(0);

    await this.prisma.bankrollHistory.create({
      data: {
        bankrollId,
        balance: newBalance.toString(),
        unidValue: newUnidValue.toString(),
        addedBalance: addedBalance.toString(),
        withdrawals: withdrawals.toString(),
        gains: '0',
        losses: '0',
        profitAndLoss: '0',
        result: balanceDiff.toString(),
      },
    });
  }

  async updateBankrollByEvent(data: BankrollUpdateData) {
    const { bankrollId, unitsChange, monetaryChange, reason } = data;

    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id: bankrollId },
      include: {
        histories: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    if (!bankroll) throw new NotFoundException('Bankroll not found');

    const oldBalance = new Decimal(bankroll.balance);
    const oldUnidValue = new Decimal(bankroll.unidValue);

    let newBalance: Decimal;

    switch (reason) {
      case 'BET_PLACED':
        // Apenas debita o valor da aposta
        newBalance = oldBalance.sub(monetaryChange.abs());
        break;
      case 'BET_WON':
        // Adiciona o lucro líquido
        newBalance = oldBalance.add(monetaryChange);
        break;
      case 'BET_LOST':
        // Já foi debitado na criação da aposta, mantém
        newBalance = oldBalance;
        break;
      case 'BET_VOID':
        // Devolve unidades e valor
        newBalance = oldBalance.add(monetaryChange);
        break;
      default:
        newBalance = oldBalance;
    }

    // Atualiza saldo da banca
    await this.prisma.bankroll.update({
      where: { id: bankrollId },
      data: { balance: newBalance },
    });

    // Histórico
    const lastHistory = bankroll.histories[0];
    const historyData = this.calculateHistoryDataEvent(
      lastHistory,
      monetaryChange,
      reason,
    );

    await this.prisma.bankrollHistory.create({
      data: {
        bankrollId,
        balance: newBalance.toString(),
        unidValue: oldUnidValue.toString(),
        addedBalance: historyData.addedBalance.toString(),
        withdrawals: historyData.withdrawals.toString(),
        gains: historyData.gains.toString(),
        losses: historyData.losses.toString(),
        profitAndLoss: historyData.profitAndLoss.toString(),
        result: historyData.result.toString(),
      },
    });

    return { newBalance, monetaryChange };
  }

  private calculateHistoryDataEvent(
    lastHistory: BankrollHistory | undefined,
    monetaryChange: Decimal,
    reason: string,
  ) {
    const prevAdded = lastHistory?.addedBalance ?? new Decimal(0);
    const prevWithdrawals = lastHistory?.withdrawals ?? new Decimal(0);
    const prevGains = lastHistory?.gains ?? new Decimal(0);
    const prevLosses = lastHistory?.losses ?? new Decimal(0);

    const addedBalance = new Decimal(prevAdded);
    let withdrawals = new Decimal(prevWithdrawals);
    let gains = new Decimal(prevGains);
    let losses = new Decimal(prevLosses);

    switch (reason) {
      case 'BET_PLACED': // Registra o débito inicial como uma "retirada" para a aposta
        withdrawals = withdrawals.add(monetaryChange.abs());
        break;
      case 'BET_WON':
        gains = gains.add(monetaryChange); // Aqui você também deveria subtrair o valor da aposta de 'withdrawals', mas
        // a maioria dos sistemas registra apenas o lucro líquido.
        break;
      case 'BET_LOST': // 1. Remove o débito inicial de 'withdrawals' (saques/aposta)
        withdrawals = withdrawals.sub(monetaryChange.abs()); // monetaryChange.abs() é o valor da aposta
        // 2. Adiciona o valor da perda em 'losses'
        losses = losses.add(monetaryChange.abs());
        break;
      case 'BET_VOID': // CORREÇÃO: Neutraliza o débito inicial retirando o valor de 'withdrawals'
        withdrawals = withdrawals.sub(monetaryChange); // monetaryChange é o valor POSITIVO da aposta
        // addedBalance fica inalterado, pois é um estorno, não um novo depósito
        break;
    }

    const profitAndLoss = gains.sub(losses);
    const result = addedBalance.sub(withdrawals).add(profitAndLoss);

    return { addedBalance, withdrawals, gains, losses, profitAndLoss, result };
  }

  async updateBankroll(
    id: number,
    updateData: Partial<UpdateBankrollDTO>,
  ): Promise<GetBankrollDTO> {
    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id },
    });

    if (!bankroll) {
      throw new NotFoundException('Bankroll not found!');
    }

    const oldBalance = bankroll.balance;
    const oldUnidValue = bankroll.unidValue;

    const updatedBankroll = await this.prisma.bankroll.update({
      where: { id },
      data: updateData,
      select: this.defaultSelect,
    });

    if (
      updateData.balance !== undefined ||
      updateData.unidValue !== undefined
    ) {
      await this.createHistoryRecord(
        id,
        oldBalance,
        updatedBankroll.balance,
        oldUnidValue,
        updatedBankroll.unidValue,
      );
    }

    return {
      ...updatedBankroll,
      statusSync: 'Synchronized',
    };
  }

  async patchUpdateBankroll(
    id: number,
    patchData: PatchBankrollDTO,
  ): Promise<GetBankrollDTO> {
    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id },
    });

    if (!bankroll) {
      throw new NotFoundException('Bankroll not found!');
    }

    const oldBalance = bankroll.balance;
    const oldUnidValue = bankroll.unidValue;

    const updatedBankroll = await this.prisma.bankroll.update({
      where: { id },
      data: {
        ...patchData,
      },
      select: this.defaultSelect,
    });

    if (patchData.balance !== undefined || patchData.unidValue !== undefined) {
      await this.createHistoryRecord(
        id,
        oldBalance,
        updatedBankroll.balance,
        oldUnidValue,
        updatedBankroll.unidValue,
      );
    }

    return {
      ...updatedBankroll,
      statusSync: 'Synchronized',
    };
  }
}
