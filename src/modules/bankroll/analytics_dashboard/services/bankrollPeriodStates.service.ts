import { Injectable } from '@nestjs/common';
import { Result } from '@prisma/client';
import { Decimal, PrismaService } from './../../../../libs/database';
import { BankrollStatsService } from './bankrollStats.service';

@Injectable()
export class BankrollPeriodStatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly streakService: BankrollStatsService,
  ) {}

  async getStats(bankrollId: number, period: '7d' | '30d' | '90d' | 'all') {
    const now = new Date();

    const periods = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      all: 3650, // 10 anos
    };

    const startDate = new Date(
      now.getTime() - periods[period] * 24 * 60 * 60 * 1000,
    );

    const endDate = now;

    const events = await this.prisma.bets.findMany({
      where: {
        bankrollId,
        placedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        stake: true,
        odd: true,
        actualReturn: true,
        result: true,
      },
    });

    if (events.length === 0) {
      return {
        betsPlaced: 0,
        winRate: 0,
        profit: 0,
        roi: 0,
        streaks: {
          currentStreak: 0,
          longestWinStreak: 0,
          longestLoseStreak: 0,
        },
      };
    }

    // 🔢 Total apostado
    const totalAmount = events.reduce(
      (acc, e) => acc.plus(e.stake),
      new Decimal(0),
    );

    // 💰 Lucro total
    const profit = events.reduce((acc, e) => {
      const actual = new Decimal(e.actualReturn ?? 0);
      return acc.plus(actual.minus(e.stake));
    }, new Decimal(0));

    // 📈 ROI
    const roi = totalAmount.gt(0) ? profit.div(totalAmount).toNumber() : 0;

    // 🏆 Win Rate
    const wins = events.filter((e) => e.result === Result.win).length;

    const winRate = wins / events.length;

    // 🔥 Streaks (vitórias / derrotas)
    const streaks = this.streakService.calculateStreaks(
      events.map((e) => ({
        id: e.id,
        result: e.result,
        odd: e.odd,
        amount: e.stake,
        actualReturn: e.actualReturn,
        stakeUnits: new Decimal(0), // não existe no select
      })),
    );

    return {
      betsPlaced: events.length,
      winRate,
      profit: profit.toNumber(),
      roi,
      streaks,
    };
  }
}
