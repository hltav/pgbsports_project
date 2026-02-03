import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService, Decimal } from './../../../../libs/database';
import {
  CreateBankrollHistoryDTO,
  UpdateBankrollDTO,
  GetBankrollDTO,
  PatchBankrollDTO,
} from '../../z.dto';
import { BankrollUpdateFields } from '../../z.dto/bankrollFields.dto';
import { BankrollUpdateData } from '../../z.dto/history/bankrollHistoryUpdate.dto';

type PrismaTx = Prisma.TransactionClient;

@Injectable()
export class UpdateBankrollService {
  constructor(private readonly prisma: PrismaService) {}

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

  // HISTÓRICO (TRANSACTION-AWARE)
  private async createHistoryRecord(
    prisma: PrismaTx,
    bankrollId: number,
    oldBalance: Decimal,
    newBalance: Decimal,
    oldUnidValue: Decimal,
    newUnidValue: Decimal,
  ) {
    const isBalanceChange = !oldBalance.equals(newBalance);
    const isUnidValueChange = !oldUnidValue.equals(newUnidValue);

    if (isBalanceChange) {
      const diff = newBalance.minus(oldBalance);
      const isDeposit = diff.greaterThan(0);
      const amount = diff.abs();

      await prisma.bankrollHistory.create({
        data: {
          bankrollId,
          type: isDeposit ? 'DEPOSIT' : 'WITHDRAWAL',
          balanceBefore: oldBalance,
          balanceAfter: newBalance,
          unidValueBefore: oldUnidValue,
          unidValueAfter: oldUnidValue,
          amount: isDeposit ? amount : amount.neg(),
          description: `Ajuste manual de saldo: ${
            isDeposit ? '+' : '-'
          }${amount.toString()}`,
        },
      });

      await prisma.bankroll.update({
        where: { id: bankrollId },
        data: isDeposit
          ? { totalDeposited: { increment: amount } }
          : { totalWithdrawn: { increment: amount } },
      });
    }

    if (isUnidValueChange) {
      await prisma.bankrollHistory.create({
        data: {
          bankrollId,
          type: 'UNID_VALUE_CHANGE',
          balanceBefore: newBalance,
          balanceAfter: newBalance,
          unidValueBefore: oldUnidValue,
          unidValueAfter: newUnidValue,
          amount: new Decimal(0),
          description: `Ajuste manual do valor da unidade: ${oldUnidValue.toString()} → ${newUnidValue.toString()}`,
        },
      });
    }
  }

  //EVENTOS (BET, DEPOSIT, WITHDRAW)
  // async updateBankrollByEvent(
  //   data: BankrollUpdateData,
  //   prisma: PrismaTx = this.prisma,
  // ) {
  //   const bankroll = await prisma.bankroll.findUnique({
  //     where: { id: data.bankrollId },
  //   });

  //   if (!bankroll) {
  //     throw new NotFoundException('Bankroll not found');
  //   }

  //   const oldBalance = new Decimal(bankroll.balance);
  //   const oldUnidValue = new Decimal(bankroll.unidValue);

  //   let newBalance = oldBalance;
  //   const bankrollUpdateData: BankrollUpdateFields = {};
  //   let historyAmount = new Decimal(0);

  //   switch (data.type) {
  //     case 'BET_PLACED': {
  //       // ✅ CORRETO: Calcula valor monetário a partir das unidades
  //       const stakeInUnits = data.stake ?? new Decimal(0);
  //       const monetaryStake = stakeInUnits.mul(oldUnidValue);

  //       console.log('🔍 DEBUG - BET_PLACED:');
  //       console.log('stakeInUnits:', stakeInUnits.toString());
  //       console.log('unitValue:', oldUnidValue.toString());
  //       console.log('monetaryStake:', monetaryStake.toString());
  //       console.log('oldBalance:', oldBalance.toString());

  //       if (oldBalance.lessThan(monetaryStake)) {
  //         throw new BadRequestException('Saldo insuficiente para aposta');
  //       }

  //       newBalance = oldBalance.sub(monetaryStake);
  //       bankrollUpdateData.totalStaked = { increment: monetaryStake };
  //       historyAmount = monetaryStake.neg();
  //       break;
  //     }

  //     case 'BET_WIN': {
  //       newBalance = oldBalance.add(data.amount);
  //       bankrollUpdateData.totalReturned = { increment: data.amount };
  //       historyAmount = data.amount;
  //       break;
  //     }

  //     case 'BET_LOSS': {
  //       historyAmount = data.stake?.neg() ?? new Decimal(0);
  //       break;
  //     }

  //     case 'BET_VOID': {
  //       // ✅ CORRETO: Usa stake × unitValue para calcular reembolso
  //       const stakeInUnits = data.stake ?? new Decimal(0);
  //       const refund = stakeInUnits.mul(oldUnidValue);
  //       newBalance = oldBalance.add(refund);
  //       historyAmount = refund;
  //       break;
  //     }

  //     case 'DEPOSIT': {
  //       const amount = data.amount.abs();
  //       newBalance = oldBalance.add(amount);
  //       bankrollUpdateData.totalDeposited = { increment: amount };
  //       historyAmount = amount;
  //       break;
  //     }

  //     case 'WITHDRAWAL': {
  //       const amount = data.amount.abs();

  //       if (oldBalance.lessThan(amount)) {
  //         throw new BadRequestException('Saldo insuficiente para saque');
  //       }
  //       newBalance = oldBalance.sub(amount);
  //       bankrollUpdateData.totalWithdrawn = { increment: amount };
  //       historyAmount = amount.neg();
  //       break;
  //     }
  //   }

  //   await prisma.bankroll.update({
  //     where: { id: data.bankrollId },
  //     data: {
  //       balance: newBalance,
  //       ...bankrollUpdateData,
  //     },
  //   });

  //   const history: CreateBankrollHistoryDTO = {
  //     bankrollId: data.bankrollId,
  //     type: data.type,
  //     balanceBefore: oldBalance,
  //     balanceAfter: newBalance,
  //     unidValueBefore: oldUnidValue,
  //     unidValueAfter: oldUnidValue,
  //     amount: historyAmount,
  //     betId: data.betId ?? null,
  //     description: data.description ?? data.eventName ?? null,
  //   };

  //   await prisma.bankrollHistory.create({
  //     data: history,
  //   });

  //   return {
  //     newBalance,
  //     type: data.type,
  //     monetaryChange: historyAmount,
  //   };
  // }

  // EVENTOS (BET, DEPOSIT, WITHDRAW)
  async updateBankrollByEvent(
    data: BankrollUpdateData,
    prisma: PrismaTx = this.prisma,
  ) {
    const bankroll = await prisma.bankroll.findUnique({
      where: { id: data.bankrollId },
    });

    if (!bankroll) {
      throw new NotFoundException('Bankroll not found');
    }

    const oldBalance = new Decimal(bankroll.balance);
    const oldUnidValue = new Decimal(bankroll.unidValue);

    let balanceDelta = new Decimal(0);
    let historyAmount = new Decimal(0);
    const bankrollUpdateData: BankrollUpdateFields = {};

    switch (data.type) {
      case 'BET_PLACED': {
        const stakeInUnits = data.stake ?? new Decimal(0);
        const monetaryStake = stakeInUnits.mul(oldUnidValue);

        if (oldBalance.lessThan(monetaryStake)) {
          throw new BadRequestException('Saldo insuficiente para aposta');
        }

        balanceDelta = monetaryStake.neg();
        historyAmount = balanceDelta;
        bankrollUpdateData.totalStaked = { increment: monetaryStake };
        break;
      }

      case 'BET_WIN': {
        const amount = data.amount;

        balanceDelta = amount;
        historyAmount = amount;
        bankrollUpdateData.totalReturned = { increment: amount };
        break;
      }

      case 'BET_LOSS': {
        // Nada muda no saldo aqui, já foi descontado no BET_PLACED
        historyAmount = new Decimal(0);
        break;
      }

      case 'BET_VOID': {
        const stakeInUnits = data.stake ?? new Decimal(0);
        const refund = stakeInUnits.mul(oldUnidValue);

        balanceDelta = refund;
        historyAmount = refund;
        break;
      }

      case 'DEPOSIT': {
        const amount = data.amount.abs();

        balanceDelta = amount;
        historyAmount = amount;
        bankrollUpdateData.totalDeposited = { increment: amount };
        break;
      }

      case 'WITHDRAWAL': {
        const amount = data.amount.abs();

        if (oldBalance.lessThan(amount)) {
          throw new BadRequestException('Saldo insuficiente para saque');
        }

        balanceDelta = amount.neg();
        historyAmount = balanceDelta;
        bankrollUpdateData.totalWithdrawn = { increment: amount };
        break;
      }

      default:
        throw new BadRequestException('Tipo de evento inválido');
    }

    // 🔒 UPDATE ATÔMICO — ponto crítico
    const updated = await prisma.bankroll.update({
      where: { id: data.bankrollId },
      data: {
        balance: { increment: balanceDelta },
        ...bankrollUpdateData,
      },
    });

    const balanceAfter = new Decimal(updated.balance);
    const balanceBefore = balanceAfter.minus(balanceDelta);

    const history: CreateBankrollHistoryDTO = {
      bankrollId: data.bankrollId,
      type: data.type,
      balanceBefore,
      balanceAfter,
      unidValueBefore: oldUnidValue,
      unidValueAfter: oldUnidValue,
      amount: historyAmount,
      betId: data.betId ?? null,
      description: data.description ?? data.eventName ?? null,
    };

    await prisma.bankrollHistory.create({
      data: history,
    });

    return {
      newBalance: balanceAfter,
      type: data.type,
      monetaryChange: historyAmount,
    };
  }

  // UPDATE COMPLETO
  async updateBankroll(
    id: number,
    updateData: Partial<UpdateBankrollDTO>,
    prisma: PrismaTx = this.prisma,
  ): Promise<GetBankrollDTO> {
    const bankroll = await prisma.bankroll.findUnique({ where: { id } });

    if (!bankroll) {
      throw new NotFoundException('Bankroll not found!');
    }

    const oldBalance = new Decimal(bankroll.balance);
    const oldUnidValue = new Decimal(bankroll.unidValue);

    const updated = await prisma.bankroll.update({
      where: { id },
      data: updateData,
      select: this.defaultSelect,
    });

    if (
      updateData.balance !== undefined ||
      updateData.unidValue !== undefined
    ) {
      await this.createHistoryRecord(
        prisma,
        id,
        oldBalance,
        updated.balance,
        oldUnidValue,
        updated.unidValue,
      );
    }

    return updated;
  }

  // PATCH
  async patchUpdateBankroll(
    id: number,
    patchData: PatchBankrollDTO,
    prisma: PrismaTx = this.prisma,
  ): Promise<GetBankrollDTO> {
    const bankroll = await prisma.bankroll.findUnique({ where: { id } });

    if (!bankroll) {
      throw new NotFoundException('Bankroll not found!');
    }

    const oldBalance = new Decimal(bankroll.balance);
    const oldUnidValue = new Decimal(bankroll.unidValue);

    const updated = await prisma.bankroll.update({
      where: { id },
      data: patchData,
      select: this.defaultSelect,
    });

    if (patchData.balance !== undefined || patchData.unidValue !== undefined) {
      await this.createHistoryRecord(
        prisma,
        id,
        oldBalance,
        updated.balance,
        oldUnidValue,
        updated.unidValue,
      );
    }

    return updated;
  }
}
