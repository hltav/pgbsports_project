import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Bets } from '@prisma/client';
import { PrismaService, Decimal } from './../../../libs/database';
import { UpdateBankrollService } from './../../../modules/bankroll/core/services/update-bankroll.service';

@Injectable()
export class DeleteBetService {
  constructor(
    private prisma: PrismaService,
    private updateBankrollService: UpdateBankrollService,
  ) {}

  async deleteBet(
    betId: number,
  ): Promise<{ message: string; deletedBet: Bets }> {
    return this.prisma.$transaction(async (tx) => {
      const existingBet = await tx.bets.findUnique({
        where: { id: betId },
      });

      if (!existingBet) {
        throw new NotFoundException(`Bet with ID ${betId} not found`);
      }

      if (existingBet.result !== 'pending') {
        throw new BadRequestException(
          'Cannot delete a settled bet. Please void it instead.',
        );
      }

      const stake = new Decimal(existingBet.stake.toString());

      // 1️⃣ Estornar a banca
      await this.updateBankrollService.updateBankrollByEvent(
        {
          bankrollId: existingBet.bankrollId,
          type: 'BET_VOID',
          amount: stake,
          stake,
          odd: existingBet.odd,
          potentialReturn: new Decimal(
            existingBet.potentialReturn?.toString() ?? 0,
          ),
          betId: existingBet.id,
          eventName: existingBet.eventDescription,
          description: `Aposta deletada (pendente): ${existingBet.eventDescription} - ${existingBet.selection}`,
        },
        tx,
      );

      // 2️⃣ Deletar aposta
      const deletedBet = await tx.bets.delete({
        where: { id: betId },
      });

      return {
        message: 'Bet deleted successfully and stake refunded to bankroll',
        deletedBet,
      };
    });
  }

  /**
   * Deleta apostas uma a uma.
   * Cada aposta é processada em sua própria transação.
   * Uma falha não afeta as demais exclusões.
   */

  async deleteBets(betIds: number[]): Promise<{
    message: string;
    deletedCount: number;
    errors: Array<{ betId: number; error: string }>;
  }> {
    const errors: Array<{ betId: number; error: string }> = [];
    let deletedCount = 0;

    for (const betId of betIds) {
      try {
        await this.deleteBet(betId);
        deletedCount++;
      } catch (error) {
        errors.push({
          betId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      message: `${deletedCount} bet(s) deleted successfully`,
      deletedCount,
      errors,
    };
  }

  async voidBet(betId: number, reason?: string): Promise<Bets> {
    return this.prisma.$transaction(async (tx) => {
      const existingBet = await tx.bets.findUnique({
        where: { id: betId },
      });

      if (!existingBet) {
        throw new NotFoundException(`Bet with ID ${betId} not found`);
      }

      const stake = new Decimal(existingBet.stake.toString());

      const voidedBet = await tx.bets.update({
        where: { id: betId },
        data: {
          result: 'void',
          isWin: null,
          actualReturn: new Decimal(0),
          profit: new Decimal(0),
          roi: new Decimal(0),
          settledAt: new Date(),
          notes: reason
            ? `${existingBet.notes ? existingBet.notes + ' | ' : ''}VOID: ${reason}`
            : existingBet.notes,
        },
      });

      await this.updateBankrollService.updateBankrollByEvent(
        {
          bankrollId: existingBet.bankrollId,
          type: 'BET_VOID',
          amount: stake,
          stake,
          odd: existingBet.odd,
          potentialReturn: new Decimal(
            existingBet.potentialReturn?.toString() ?? 0,
          ),
          betId: existingBet.id,
          eventName: existingBet.eventDescription,
          description: reason
            ? `Aposta anulada: ${existingBet.eventDescription} - Motivo: ${reason}`
            : `Aposta anulada: ${existingBet.eventDescription}`,
        },
        tx,
      );

      return voidedBet;
    });
  }
}
