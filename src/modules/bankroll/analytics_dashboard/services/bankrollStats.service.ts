import { Injectable } from '@nestjs/common';
import { PrismaService, Decimal } from './../../../../libs/database';
import { Result } from '@prisma/client';
import { BankrollStatsDTO } from '../dto/analytics_dashboard.dto';

export type EventStreakItem = {
  id: number;
  result: Result;
};

@Injectable()
export class BankrollStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBankrollStats(
    bankrollId: number,
    userId: number,
  ): Promise<BankrollStatsDTO> {
    const events = await this.prisma.bets.findMany({
      where: { bankrollId, userId },
      select: {
        id: true,
        odd: true,
        stake: true,
        actualReturn: true,
        result: true,
        stakeInUnits: true,
      },
    });

    if (events.length === 0) {
      return this.emptyStats();
    }

    // ---- CONTAGENS ----
    const totalBets = events.length;

    const wonBets = events.filter((e) => e.result === 'win').length;
    const lostBets = events.filter((e) => e.result === 'lose').length;
    const pendingBets = events.filter((e) => e.result === 'pending').length;

    // ---- WIN RATE ----
    const winRate = new Decimal(wonBets).div(totalBets);

    // ---- VALORES FINANCEIROS ----
    const totalProfit = events.reduce((acc, e) => {
      const profit = (e.actualReturn ?? new Decimal(0)).minus(e.stake);
      return acc.plus(profit);
    }, new Decimal(0));

    const roi = totalProfit.div(
      events.reduce((acc, e) => acc.plus(e.stake), new Decimal(0)),
    );

    // ---- STAKE & ODDS ----
    const avgStake = events
      .reduce((acc, e) => acc.plus(e.stake), new Decimal(0))
      .div(totalBets);

    const avgOdds = events
      .reduce((acc, e) => acc.plus(e.odd), new Decimal(0))
      .div(totalBets);

    // ---- BIGGEST WIN / LOSS ----
    const biggestWin = events.reduce((max, e) => {
      const p = (e.actualReturn ?? new Decimal(0)).minus(e.stake);
      return p.gt(max) ? p : max;
    }, new Decimal(0));

    const biggestLoss = events.reduce((max, e) => {
      const p = (e.actualReturn ?? new Decimal(0)).minus(e.stake);
      return p.lt(max) ? p : max;
    }, new Decimal(0));

    // ---- STREAKS ----
    const { currentStreak, longestWinStreak, longestLoseStreak } =
      this.calculateStreaks(
        events.map((e) => ({
          id: e.id,
          result: e.result,
        })),
      );

    return {
      totalBets,
      wonBets,
      lostBets,
      pendingBets,
      winRate,
      roi,
      totalProfit,
      avgStake,
      avgOdds,
      currentStreak,
      longestWinStreak,
      longestLoseStreak,
      biggestWin,
      biggestLoss,
    };
  }

  // Caso o bankroll não tenha eventos
  private emptyStats(): BankrollStatsDTO {
    const zero = new Decimal(0);

    return {
      totalBets: 0,
      wonBets: 0,
      lostBets: 0,
      pendingBets: 0,
      winRate: zero,
      roi: zero,
      totalProfit: zero,
      avgStake: zero,
      avgOdds: zero,
      currentStreak: 0,
      longestWinStreak: 0,
      longestLoseStreak: 0,
      biggestWin: zero,
      biggestLoss: zero,
    };
  }

  // ---- Função de streaks ----
  public calculateStreaks(events: EventStreakItem[]) {
    let current = 0;
    let longestWin = 0;
    let longestLose = 0;

    // Ordena do mais antigo para o mais recente
    const sorted = [...events].sort((a, b) => a.id - b.id);

    for (const e of sorted) {
      if (e.result === 'win') {
        current = current >= 0 ? current + 1 : 1;
        longestWin = Math.max(longestWin, current);
      } else if (e.result === 'lose') {
        current = current <= 0 ? current - 1 : -1;
        longestLose = Math.min(longestLose, current);
      }
    }

    return {
      currentStreak: current,
      longestWinStreak: longestWin,
      longestLoseStreak: Math.abs(longestLose),
    };
  }
}
