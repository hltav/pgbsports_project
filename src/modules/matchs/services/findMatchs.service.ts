import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MatchStatus, Prisma } from '@prisma/client';
import { PrismaService } from './../../../libs/database';
import { GetMatchDTO } from '../dto';

@Injectable()
export class FindMatchService {
  private readonly logger = new Logger(FindMatchService.name);

  constructor(private readonly prisma: PrismaService) {}

  // FIND ONE BY ID
  async findOne(id: number): Promise<GetMatchDTO> {
    this.logger.log(`Finding match by id: ${id}`);
    const match = await this.prisma.externalMatch.findUnique({
      where: { id },
      include: {
        bets: {
          select: {
            id: true,
            result: true,
            stake: true,
            odd: true,
          },
        },
      },
    });
    if (!match) {
      throw new NotFoundException(`Match with id ${id} not found`);
    }
    return match;
  }

  // FIND ONE BY API EVENT ID
  async findByApiSportsEventId(
    apiSportsEventId: string,
  ): Promise<GetMatchDTO | null> {
    this.logger.log(`Finding match by apiSportsEventId: ${apiSportsEventId}`);
    return this.prisma.externalMatch.findUnique({
      where: { apiSportsEventId },
    });
  }

  // FIND ALL (com filtros e paginação)
  async findAll(params: {
    sport?: string;
    league?: string;
    status?: MatchStatus;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    perPage?: number;
  }) {
    const {
      sport,
      league,
      status,
      dateFrom,
      dateTo,
      page = 1,
      perPage = 20,
    } = params;

    const where: Prisma.ExternalMatchWhereInput = {};

    if (sport) where.sport = sport;
    if (league) where.league = { contains: league, mode: 'insensitive' };
    if (status) where.status = status;

    if (dateFrom || dateTo) {
      where.eventDate = {};
      if (dateFrom) where.eventDate.gte = dateFrom;
      if (dateTo) where.eventDate.lte = dateTo;
    }

    const [matches, total] = await Promise.all([
      this.prisma.externalMatch.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { eventDate: 'desc' },
        include: {
          _count: {
            select: { bets: true },
          },
        },
      }),
      this.prisma.externalMatch.count({ where }),
    ]);

    return {
      data: matches,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  // FIND MATCHES NEEDING SYNC
  async findMatchesNeedingSync(limit = 50): Promise<GetMatchDTO[]> {
    this.logger.log(`Finding matches needing sync (limit: ${limit})`);

    const matches = await this.prisma.externalMatch.findMany({
      where: {
        status: {
          // ✅ Inclui TODOS os status que não são finalizados
          in: [
            MatchStatus.SCHEDULED,
            MatchStatus.NOT_STARTED,
            MatchStatus.LIVE,
            MatchStatus.FIRST_HALF,
            MatchStatus.SECOND_HALF,
            MatchStatus.HALF_TIME,
          ],
        },
        syncAttempts: { lt: 5 }, // Não tentar mais que 5 vezes
        // ✅ Removido filtro de data para pegar jogos futuros também
      },
      orderBy: { eventDate: 'asc' },
      take: limit,
    });

    this.logger.log(
      `✅ Found ${matches.length} matches needing sync: ${matches.map((m) => `${m.id}:${m.apiSportsEventId}(${m.status})`).join(', ')}`,
    );

    return matches;
  }
}
