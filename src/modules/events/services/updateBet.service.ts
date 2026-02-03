import { Injectable, NotFoundException } from '@nestjs/common';
import { Bets, Prisma } from '@prisma/client';
import { PrismaService, Decimal } from './../../../libs/database';
import { UpdateBankrollService } from './../../../modules/bankroll/core/services/update-bankroll.service';
import { UpdateBetDTO } from '../dto/create-event.dto';

@Injectable()
export class UpdateBetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly updateBankrollService: UpdateBankrollService,
  ) {}

  async updateBet(data: UpdateBetDTO): Promise<Bets> {
    return this.prisma.$transaction(async (tx) => {
      const existingBet = await tx.bets.findUnique({
        where: { id: data.id },
        include: {
          bankroll: {
            select: { balance: true, unidValue: true },
          },
        },
      });

      if (!existingBet) {
        throw new NotFoundException(`Bet with ID ${data.id} not found`);
      }

      const previousResult = existingBet.result;
      const unitValue = existingBet.bankroll.unidValue;

      const updateData: Prisma.BetsUpdateInput = {};

      /* ---------- ExternalMatch ---------- */
      if (data.externalMatchId !== undefined && data.externalMatchId !== null) {
        const match = await tx.externalMatch.findUnique({
          where: { id: data.externalMatchId },
        });

        if (!match) {
          throw new NotFoundException('ExternalMatch not found');
        }

        updateData.externalMatch = { connect: { id: match.id } };
        updateData.eventDate = match.eventDate;
        updateData.sport = match.sport;
        updateData.league = match.league;
        updateData.eventDescription = `${match.homeTeam} vs ${match.awayTeam}`;
        updateData.homeTeam = match.homeTeam;
        updateData.awayTeam = match.awayTeam;
        updateData.homeTeamBadge = match.homeTeamBadge;
        updateData.awayTeamBadge = match.awayTeamBadge;
        updateData.leagueBadge = match.leagueBadge;
        updateData.apiSportsEventId = match.apiSportsEventId;
        updateData.tsdbEventId = match.tsdbEventId;
      }

      /* ---------- Campos simples ---------- */
      if (data.apiSportsEventId !== undefined)
        updateData.apiSportsEventId = data.apiSportsEventId;
      if (data.tsdbEventId !== undefined)
        updateData.tsdbEventId = data.tsdbEventId;
      if (data.sport !== undefined) updateData.sport = data.sport;
      if (data.league !== undefined) updateData.league = data.league;
      if (data.eventDescription !== undefined)
        updateData.eventDescription = data.eventDescription;
      if (data.eventDate !== undefined) updateData.eventDate = data.eventDate;
      if (data.homeTeam !== undefined) updateData.homeTeam = data.homeTeam;
      if (data.awayTeam !== undefined) updateData.awayTeam = data.awayTeam;
      if (data.market !== undefined) updateData.market = data.market;
      if (data.marketCategory !== undefined)
        updateData.marketCategory = data.marketCategory;
      if (data.marketSub !== undefined) updateData.marketSub = data.marketSub;
      if (data.selection !== undefined) updateData.selection = data.selection;
      if (data.confidence !== undefined)
        updateData.confidence = data.confidence;
      if (data.expectedValue !== undefined)
        updateData.expectedValue = data.expectedValue;
      if (data.betType !== undefined) updateData.betType = data.betType;
      if (data.isLive !== undefined) updateData.isLive = data.isLive;
      if (data.tags !== undefined)
        updateData.tags = data.tags ?? Prisma.JsonNull;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.result !== undefined) updateData.result = data.result;
      if (data.isWin !== undefined) updateData.isWin = data.isWin;
      if (data.settledAt !== undefined) updateData.settledAt = data.settledAt;

      /* ---------- Odd e Stake (SOMENTE SE ALTERADOS) ---------- */
      // Variáveis para usar no settlement
      let stakeInUnits = existingBet.stakeInUnits;
      let monetaryStake = existingBet.stake;
      let odd = existingBet.odd;

      // ✅ Só recalcula se ODD foi alterada
      if (data.odd !== undefined) {
        odd = new Decimal(data.odd);
        updateData.odd = odd;

        // Se mudou a odd, recalcula potentialReturn
        updateData.potentialReturn = monetaryStake.mul(odd);
      }

      // ✅ Só recalcula se STAKE foi alterado
      if (data.stake !== undefined) {
        stakeInUnits = new Decimal(data.stake);
        monetaryStake = stakeInUnits.mul(unitValue);

        updateData.stake = monetaryStake;
        updateData.stakeInUnits = stakeInUnits;
        updateData.potentialReturn = monetaryStake.mul(odd);

        console.log('🔍 DEBUG UPDATE - Recalculando stake:');
        console.log('stakeInUnits (unidades):', stakeInUnits.toString());
        console.log('monetaryStake (R$):', monetaryStake.toString());
        console.log('unitValue (R$):', unitValue.toString());
        console.log('odd:', odd.toString());
        console.log('potentialReturn (R$):', monetaryStake.mul(odd).toString());
      }

      /* ---------- Ajuste de stake na banca ---------- */
      if (
        data.stake !== undefined &&
        !monetaryStake.equals(existingBet.stake)
      ) {
        const diff = monetaryStake.sub(existingBet.stake);

        await this.updateBankrollService.updateBankrollByEvent(
          {
            bankrollId: existingBet.bankrollId,
            type: 'BET_PLACED',
            amount: diff,
            stake: stakeInUnits,
            odd,
            potentialReturn: monetaryStake.mul(odd),
            betId: existingBet.id,
            eventName: existingBet.eventDescription,
            description: `Ajuste de stake: ${existingBet.eventDescription}`,
          },
          tx,
        );
      }

      /* ---------- ActualReturn / Profit / ROI ---------- */
      if (data.actualReturn !== undefined && data.actualReturn !== null) {
        const actualReturn = new Decimal(data.actualReturn);
        const profit = actualReturn.sub(monetaryStake);
        const roi = monetaryStake.gt(0)
          ? profit.div(monetaryStake).mul(100)
          : new Decimal(0);

        updateData.actualReturn = actualReturn;
        updateData.profit = profit;
        updateData.roi = roi;
      }

      /* ---------- Atualizar aposta ---------- */
      const updatedBet = await tx.bets.update({
        where: { id: data.id },
        data: updateData,
      });

      /* ---------- Settlement ---------- */
      const resultChanged =
        data.result !== undefined && data.result !== previousResult;

      if (resultChanged) {
        const actualReturn = updatedBet.actualReturn ?? new Decimal(0);

        switch (updatedBet.result) {
          case 'win':
            await this.updateBankrollService.updateBankrollByEvent(
              {
                bankrollId: updatedBet.bankrollId,
                type: 'BET_WIN',
                amount: actualReturn,
                stake: stakeInUnits,
                odd,
                potentialReturn: updatedBet.potentialReturn,
                betId: updatedBet.id,
                eventName: updatedBet.eventDescription,
                description: `Aposta vencedora`,
              },
              tx,
            );
            break;

          case 'lose':
            await this.updateBankrollService.updateBankrollByEvent(
              {
                bankrollId: updatedBet.bankrollId,
                type: 'BET_LOSS',
                amount: new Decimal(0),
                stake: stakeInUnits,
                betId: updatedBet.id,
                eventName: updatedBet.eventDescription,
                description: `Aposta perdida`,
              },
              tx,
            );
            break;

          case 'void':
          case 'returned':
            await this.updateBankrollService.updateBankrollByEvent(
              {
                bankrollId: updatedBet.bankrollId,
                type: 'BET_VOID',
                amount: monetaryStake,
                stake: stakeInUnits,
                betId: updatedBet.id,
                eventName: updatedBet.eventDescription,
                description: `Aposta anulada`,
              },
              tx,
            );
            break;
        }
      }

      return updatedBet;
    });
  }
}
