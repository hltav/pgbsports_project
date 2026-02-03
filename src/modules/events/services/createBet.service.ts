import { Injectable, NotFoundException } from '@nestjs/common';
import { Bets, Prisma } from '@prisma/client';
import { PrismaService, Decimal } from './../../../libs/database';
import { UpdateBankrollService } from './../../../modules/bankroll/core/services/update-bankroll.service';
import { CreateBetDTO } from '../dto/create-event.dto';
import { CreateMatchService } from './../../..//modules/matchs/services/createMatchs.service';

@Injectable()
export class CreateBetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly updateBankrollService: UpdateBankrollService,
    private readonly createMatchService: CreateMatchService,
  ) {}

  async createBet(data: CreateBetDTO, userId: number): Promise<Bets> {
    return this.prisma.$transaction(async (tx) => {
      let processedEventDate: Date | null = null;
      let finalExternalMatchId: number;

      // =========================
      // 📌 BUSCAR OU CRIAR ExternalMatch
      // =========================
      if (data.externalMatchId) {
        // Cenário 1: ExternalMatch já informado
        const match = await tx.externalMatch.findUnique({
          where: { id: data.externalMatchId },
        });

        if (!match) {
          throw new NotFoundException('ExternalMatch not found');
        }

        finalExternalMatchId = match.id;
        processedEventDate = match.eventDate;
      } else {
        // Cenário 2: Criar ou buscar ExternalMatch

        if (data.eventDate) {
          const d = new Date(data.eventDate as string | number | Date);
          if (!isNaN(d.getTime())) {
            processedEventDate = d;
          }
        }

        // 🆕 API-SPORTS como fonte primária
        const apiSportsEventId =
          data.apiSportsEventId || `manual_${Date.now()}_${userId}`;
        const tsdbEventId = data.tsdbEventId || null; // Opcional
        const apiSource = data.apiSportsEventId ? 'api-sports' : 'manual'; // 🆕 MUDANÇA AQUI

        // Tentar buscar existente primeiro
        let externalMatch = await tx.externalMatch.findUnique({
          where: { apiSportsEventId },
        });

        // Se não existir, criar
        if (!externalMatch) {
          externalMatch = await tx.externalMatch.create({
            data: {
              apiSportsEventId,
              tsdbEventId, // 🆕 Pode ser null
              apiSource, // 🆕 'api-sports' ou 'manual'
              sport: data.sport,
              league: data.league,
              leagueBadge: data.leagueBadge || null,
              homeTeam: data.homeTeam || 'TBD',
              awayTeam: data.awayTeam || 'TBD',
              homeTeamBadge: data.homeTeamBadge || null,
              awayTeamBadge: data.awayTeamBadge || null,
              eventDate: processedEventDate || new Date(),
              lastSyncAt: new Date(),
              syncAttempts: 0,
            },
          });
        }

        finalExternalMatchId = externalMatch.id;
      }

      // Buscar o match completo para criar snapshot
      const match = await tx.externalMatch.findUnique({
        where: { id: finalExternalMatchId },
      });

      if (!match) {
        throw new Error('ExternalMatch not found after creation');
      }

      const matchSnapshot = {
        sport: match.sport,
        league: match.league,
        eventDescription: `${match.homeTeam} vs ${match.awayTeam}`,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeTeamBadge: match.homeTeamBadge,
        awayTeamBadge: match.awayTeamBadge,
        leagueBadge: match.leagueBadge,
      };

      // =========================
      // 💰 BUSCAR BANCA
      // =========================
      const bankroll = await tx.bankroll.findUnique({
        where: { id: data.bankrollId, userId },
        select: { balance: true, unidValue: true },
      });

      if (!bankroll) {
        throw new NotFoundException('Bankroll not found');
      }

      // =========================
      // 🧮 CÁLCULOS
      // =========================
      const stakeInUnits = new Decimal(data.stake);
      const monetaryStake = stakeInUnits.mul(bankroll.unidValue);
      const odd = new Decimal(data.odd);
      const potentialReturn = monetaryStake.mul(odd);

      // =========================
      // 🎯 CRIAR APOSTA
      // =========================
      const bet = await tx.bets.create({
        data: {
          bankrollId: data.bankrollId,
          userId: userId,
          externalMatchId: finalExternalMatchId,
          apiSportsEventId: match.apiSportsEventId,
          tsdbEventId: match.tsdbEventId,
          sport: matchSnapshot.sport,
          league: matchSnapshot.league,
          eventDescription: matchSnapshot.eventDescription,
          eventDate: match.eventDate,
          homeTeam: matchSnapshot.homeTeam,
          awayTeam: matchSnapshot.awayTeam,
          homeTeamBadge: matchSnapshot.homeTeamBadge,
          awayTeamBadge: matchSnapshot.awayTeamBadge,
          leagueBadge: matchSnapshot.leagueBadge,
          market: data.market,
          marketCategory: data.marketCategory,
          marketSub: data.marketSub ?? null,
          selection: data.selection,
          odd,
          stake: stakeInUnits,
          potentialReturn,
          actualReturn: null,
          bankrollBalance: bankroll.balance,
          unitValue: bankroll.unidValue,
          stakeInUnits: stakeInUnits,
          result: 'pending',
          isWin: null,
          profit: null,
          roi: null,
          confidence: data.confidence ?? null,
          expectedValue: data.expectedValue
            ? new Decimal(data.expectedValue)
            : null,
          betType: data.betType ?? 'SINGLE',
          isLive: data.isLive ?? false,
          tags: data.tags ?? Prisma.JsonNull,
          notes: data.notes ?? null,
        },
      });

      // =========================
      // 🔄 ATUALIZAR BANCA
      // =========================
      await this.updateBankrollService.updateBankrollByEvent(
        {
          bankrollId: data.bankrollId,
          type: 'BET_PLACED',
          amount: monetaryStake.neg(),
          stake: stakeInUnits,
          odd,
          potentialReturn,
          betId: bet.id,
          eventName: matchSnapshot.eventDescription,
          description: `Aposta: ${matchSnapshot.eventDescription} - ${data.selection}`,
        },
        tx,
      );

      return bet;
    });
  }
}
