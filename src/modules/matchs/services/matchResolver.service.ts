import { Injectable } from '@nestjs/common';
import { CreateBetDTO } from '../../../libs';
import { PrismaService } from '../../../libs/database';

@Injectable()
export class MatchResolverService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveOrCreateFromBet(data: CreateBetDTO) {
    if (!data.apiSportsEventId) return null;

    const existing = await this.prisma.externalMatch.findUnique({
      where: { apiSportsEventId: data.apiSportsEventId },
    });

    if (existing) return existing;

    // ⚠️ Criação mínima (SEM placar)
    return this.prisma.externalMatch.create({
      data: {
        apiSportsEventId: data.apiSportsEventId,
        tsdbEventId: data.apiSportsEventId,
        apiSource: 'api-sports',
        sport: data.sport,
        league: data.league,
        homeTeam: data.homeTeam!,
        awayTeam: data.awayTeam!,
        eventDate: new Date(),
        status: 'SCHEDULED',
      },
    });
  }
}
