import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { GetBankrollDTO, CreateBankrollHistoryDTO } from '../z.dto';
import { UpdateBankrollDTO, PatchBankrollDTO } from '../z.dto';
import { BankrollUpdateFields } from '../z.dto/bankrollFields.dto';
import { BankrollUpdateData } from '../z.dto/bankrollHistoryUpdate.dto';

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
    totalDeposited: true,
    totalWithdrawn: true,
    totalStaked: true,
    totalReturned: true,
  };

  private async createHistoryRecord(
    bankrollId: number,
    oldBalance: Decimal,
    newBalance: Decimal,
    oldUnidValue: Decimal,
    newUnidValue: Decimal,
  ) {
    const isBalanceChange = !oldBalance.equals(newBalance);
    const isUnidValueChange = !oldUnidValue.equals(newUnidValue);

    if (isBalanceChange) {
      const balanceDiff = newBalance.minus(oldBalance);
      const isDeposit = balanceDiff.greaterThan(0);
      const amount = balanceDiff.abs();

      await this.prisma.bankrollHistory.create({
        data: {
          bankrollId,
          type: isDeposit ? 'DEPOSIT' : 'WITHDRAWAL',
          balanceBefore: oldBalance.toString(),
          balanceAfter: newBalance.toString(),
          unidValue: newUnidValue.toString(),
          amount: amount.toString(),
          description: `Ajuste manual de saldo: ${
            isDeposit ? '+' : '-'
          }${amount.toString()}`,
        },
      });

      await this.prisma.bankroll.update({
        where: { id: bankrollId },
        data: {
          ...(isDeposit
            ? { totalDeposited: { increment: amount } }
            : { totalWithdrawn: { increment: amount } }),
        },
      });
    }

    if (isUnidValueChange) {
      await this.prisma.bankrollHistory.create({
        data: {
          bankrollId,
          type: 'UNID_VALUE_CHANGE',
          balanceBefore: newBalance.toString(),
          balanceAfter: newBalance.toString(),
          unidValue: newUnidValue.toString(),
          unidValueBefore: oldUnidValue.toString(),
          unidValueAfter: newUnidValue.toString(),
          description: `Ajuste manual do valor da unidade: ${oldUnidValue.toString()} -> ${newUnidValue.toString()}`,
        },
      });
    }
  }

  async updateBankrollByEvent(data: BankrollUpdateData) {
    const {
      bankrollId,
      type,
      monetaryChange,
      stake,
      odds,
      potentialWin,
      actualReturn,
      eventId,
      eventName,
      description,
    } = data;

    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id: bankrollId },
    });

    if (!bankroll) throw new NotFoundException('Bankroll not found');

    const oldBalance = new Decimal(bankroll.balance);
    const oldUnidValue = new Decimal(bankroll.unidValue);
    let newBalance = oldBalance;

    const historyData: Partial<CreateBankrollHistoryDTO> = {
      amount: monetaryChange,
      stake,
      odds,
      potentialWin,
      actualReturn,
      eventId,
      eventName,
      description,
    };

    const bankrollUpdateData: BankrollUpdateFields = {};

    switch (type) {
      case 'BET_PLACED': {
        const stakeToSubtract = monetaryChange.abs();
        newBalance = oldBalance.sub(stakeToSubtract);

        bankrollUpdateData.totalStaked = { increment: stakeToSubtract };
        historyData.stake = stakeToSubtract;
        historyData.amount = stakeToSubtract.neg();
        break;
      }

      case 'BET_WON': {
        newBalance = oldBalance.add(monetaryChange);
        bankrollUpdateData.totalReturned = { increment: monetaryChange };
        historyData.actualReturn = monetaryChange;
        historyData.amount = monetaryChange;
        break;
      }

      case 'BET_LOST': {
        const s = stake ?? new Decimal(0);
        const lossAmount = s;

        historyData.amount = lossAmount;
        newBalance = oldBalance.add(lossAmount);

        break;
      }

      case 'BET_VOID': {
        const refund = monetaryChange.abs();
        newBalance = oldBalance.add(refund);
        historyData.actualReturn = refund;
        historyData.amount = refund;
        break;
      }

      case 'DEPOSIT': {
        const amount = monetaryChange.abs();
        newBalance = oldBalance.add(amount);
        bankrollUpdateData.totalDeposited = { increment: amount };
        historyData.amount = amount;
        break;
      }

      case 'WITHDRAWAL': {
        const amount = monetaryChange.abs();
        newBalance = oldBalance.sub(amount);
        bankrollUpdateData.totalWithdrawn = { increment: amount };
        historyData.amount = amount.neg();
        break;
      }

      default: {
        newBalance = oldBalance;
        break;
      }
    }

    await this.prisma.bankroll.update({
      where: { id: bankrollId },
      data: {
        balance: newBalance,
        ...bankrollUpdateData,
      },
    });

    const fullHistoryData: CreateBankrollHistoryDTO = {
      bankrollId,
      type,
      balanceBefore: oldBalance,
      balanceAfter: newBalance,
      unidValue: oldUnidValue,
      ...historyData,
      amount: historyData.amount ?? undefined,
      stake: historyData.stake ?? undefined,
      odds: historyData.odds ?? undefined,
      potentialWin: historyData.potentialWin ?? undefined,
      actualReturn: historyData.actualReturn ?? undefined,
    };

    await this.prisma.bankrollHistory.create({
      data: fullHistoryData,
    });

    return { newBalance, monetaryChange, type };
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

    const oldBalance = new Decimal(bankroll.balance);
    const oldUnidValue = new Decimal(bankroll.unidValue);

    const updatedBankroll = await this.prisma.bankroll.update({
      where: { id },
      data: updateData,
      select: this.defaultSelect,
    });

    if (
      updateData.balance !== undefined ||
      updateData.unidValue !== undefined ||
      updateData.totalDeposited !== undefined ||
      updateData.totalWithdrawn !== undefined
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

    const oldBalance = new Decimal(bankroll.balance);
    const oldUnidValue = new Decimal(bankroll.unidValue);

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
    };
  }
}
