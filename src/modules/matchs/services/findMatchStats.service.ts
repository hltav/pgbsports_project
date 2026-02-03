import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/libs/database';
import { FindMatchService } from './findMatchs.service';

@Injectable()
export class FindMatchStatsService {
  private readonly logger = new Logger(FindMatchStatsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly findMatchs: FindMatchService,
  ) {}

  // GET STATISTICS
  async getStatistics(matchId: number) {
    const match = await this.findMatchs.findOne(matchId);

    const stats = await this.prisma.bets.aggregate({
      where: { externalMatchId: matchId },
      _count: { id: true },
      _sum: {
        stake: true,
        actualReturn: true,
        profit: true,
      },
    });

    const betsGrouped = await this.prisma.bets.groupBy({
      by: ['result'],
      where: { externalMatchId: matchId },
      _count: { id: true },
    });

    return {
      match,
      totalBets: stats._count.id,
      totalStaked: stats._sum.stake || 0,
      totalReturned: stats._sum.actualReturn || 0,
      totalProfit: stats._sum.profit || 0,
      betsByResult: betsGrouped.reduce(
        (acc, group) => {
          acc[group.result] = group._count.id;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }
}
