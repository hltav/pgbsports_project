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

  // ---------------------------------------------------------
  // 🔒 Helpers de TX (garante atomicidade sempre)
  // ---------------------------------------------------------

  private async inTx<T>(
    txOrUndefined: PrismaTx | undefined,
    fn: (tx: PrismaTx) => Promise<T>,
  ): Promise<T> {
    if (txOrUndefined) return fn(txOrUndefined);

    // timeout aqui é opcional; mantenho um pouco maior pra escrita financeira
    return this.prisma.$transaction(async (tx) => fn(tx), { timeout: 15000 });
  }

  /**
   * Lock pessimista na linha do bankroll (evita race condition).
   * IMPORTANTE: ajuste o nome da tabela se necessário:
   * - "bankroll" vs "Bankroll"
   */
  private async lockBankrollRow(
    tx: PrismaTx,
    bankrollId: number,
  ): Promise<void> {
    await tx.$executeRaw`
      SELECT 1
      FROM "bankrolls"
      WHERE "id" = ${bankrollId}
      FOR UPDATE
    `;
  }

  // ---------------------------------------------------------
  // HISTÓRICO (TRANSACTION-AWARE)
  // ---------------------------------------------------------

  private async createHistoryRecord(
    tx: PrismaTx,
    bankrollId: number,
    oldBalance: Decimal,
    newBalance: Decimal,
    oldUnidValue: Decimal,
    newUnidValue: Decimal,
  ): Promise<void> {
    const isBalanceChange = !oldBalance.equals(newBalance);
    const isUnidValueChange = !oldUnidValue.equals(newUnidValue);

    if (isBalanceChange) {
      const diff = newBalance.minus(oldBalance);
      const isDeposit = diff.greaterThan(0);
      const amount = diff.abs();

      await tx.bankrollHistory.create({
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

      await tx.bankroll.update({
        where: { id: bankrollId },
        data: isDeposit
          ? { totalDeposited: { increment: amount } }
          : { totalWithdrawn: { increment: amount } },
      });
    }

    if (isUnidValueChange) {
      await tx.bankrollHistory.create({
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

  // ---------------------------------------------------------
  // EVENTOS (BET, DEPOSIT, WITHDRAW) — FINANCEIRO
  // ---------------------------------------------------------

  async updateBankrollByEvent(
    data: BankrollUpdateData,
    tx?: PrismaTx,
  ): Promise<{
    newBalance: Decimal;
    type: BankrollUpdateData['type'];
    monetaryChange: Decimal;
  }> {
    return this.inTx(tx, async (prismaTx) => {
      // 🔒 lock pessimista antes de ler/validar saldo
      await this.lockBankrollRow(prismaTx, data.bankrollId);

      const bankroll = await prismaTx.bankroll.findUnique({
        where: { id: data.bankrollId },
      });

      if (!bankroll) throw new NotFoundException('Bankroll not found');

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

      // ✅ update atômico (já sob lock)
      const updated = await prismaTx.bankroll.update({
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

      await prismaTx.bankrollHistory.create({ data: history });

      return {
        newBalance: balanceAfter,
        type: data.type,
        monetaryChange: historyAmount,
      };
    });
  }

  // ---------------------------------------------------------
  // UPDATE COMPLETO — SE ALTERAR SALDO/UNID, SEMPRE TX
  // ---------------------------------------------------------

  async updateBankroll(
    id: number,
    updateData: Partial<UpdateBankrollDTO>,
    tx?: PrismaTx,
  ): Promise<GetBankrollDTO> {
    return this.inTx(tx, async (prismaTx) => {
      // Se mexer em balance/unidValue, lock pra evitar conflitos
      const touchesMoney =
        updateData.balance !== undefined || updateData.unidValue !== undefined;

      if (touchesMoney) {
        await this.lockBankrollRow(prismaTx, id);
      }

      const bankroll = await prismaTx.bankroll.findUnique({ where: { id } });
      if (!bankroll) throw new NotFoundException('Bankroll not found!');

      const oldBalance = new Decimal(bankroll.balance);
      const oldUnidValue = new Decimal(bankroll.unidValue);

      const updated = await prismaTx.bankroll.update({
        where: { id },
        data: updateData,
        select: this.defaultSelect,
      });

      if (touchesMoney) {
        await this.createHistoryRecord(
          prismaTx,
          id,
          oldBalance,
          updated.balance,
          oldUnidValue,
          updated.unidValue,
        );
      }

      return updated;
    });
  }

  // ---------------------------------------------------------
  // PATCH — SE ALTERAR SALDO/UNID, SEMPRE TX
  // ---------------------------------------------------------

  async patchUpdateBankroll(
    id: number,
    patchData: PatchBankrollDTO,
    tx?: PrismaTx,
  ): Promise<GetBankrollDTO> {
    return this.inTx(tx, async (prismaTx) => {
      const touchesMoney =
        patchData.balance !== undefined || patchData.unidValue !== undefined;

      if (touchesMoney) {
        await this.lockBankrollRow(prismaTx, id);
      }

      const bankroll = await prismaTx.bankroll.findUnique({ where: { id } });
      if (!bankroll) throw new NotFoundException('Bankroll not found!');

      const oldBalance = new Decimal(bankroll.balance);
      const oldUnidValue = new Decimal(bankroll.unidValue);

      const updated = await prismaTx.bankroll.update({
        where: { id },
        data: patchData,
        select: this.defaultSelect,
      });

      if (touchesMoney) {
        await this.createHistoryRecord(
          prismaTx,
          id,
          oldBalance,
          updated.balance,
          oldUnidValue,
          updated.unidValue,
        );
      }

      return updated;
    });
  }
}
