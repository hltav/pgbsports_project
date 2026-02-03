import { Injectable, NotFoundException } from '@nestjs/common';
import { ExternalMatch } from '@prisma/client';
import { SoccerService } from '../../../api-sports/api/soccer/services/soccer.service';
import { TheSportsDbEventsService } from '../../../thesportsdb-api/services/events-thesportsdb.service';
import { FusedMatchData } from '../schemas/fusedMatchData.schema';
import { FutebolDataMapper } from '../mappers/futebolData.mapper';
import { PrismaService } from './../../../../libs/database';

@Injectable()
export class FutebolFusionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly apiSportsService: SoccerService,
    private readonly tsdbEventsService: TheSportsDbEventsService,
  ) {}

  /**
   * Realiza a fusão de dados de um objeto ExternalMatch já tipado pelo Prisma
   */
  async getFusedMatchData(match: ExternalMatch): Promise<FusedMatchData> {
    // Extração segura garantida pelo tipo ExternalMatch do Prisma
    const apiSportsFixtureId = match.apiSportsEventId;
    const tsdbFixtureId = match.tsdbEventId ?? match.apiSportsEventId;

    if (!apiSportsFixtureId) {
      throw new Error('Primary API Event ID (apiSports) is required');
    }

    // 1. Busca os dados brutos (paralelamente)
    // Usamos casting ou validação para garantir que os serviços recebam strings
    const [tsdbResponse, apiSportsResponse] = await Promise.all([
      this.tsdbEventsService.getEventById(tsdbFixtureId),
      this.apiSportsService.getFixtureById(apiSportsFixtureId),
    ]);

    // 2. Validação das respostas
    if (!tsdbResponse) {
      throw new Error(`TSDB event not found for ID: ${tsdbFixtureId}`);
    }

    if (!apiSportsResponse?.response?.[0]) {
      throw new Error(
        `API Sports fixture not found for ID: ${apiSportsFixtureId}`,
      );
    }

    // 3. Mapeamento e Fusão
    return FutebolDataMapper.toFusedMatchData(
      apiSportsResponse.response[0],
      tsdbResponse,
    );
  }

  async getFusedMatchByExternalMatchId(
    externalMatchId: number,
  ): Promise<FusedMatchData> {
    const match = await this.prisma.externalMatch.findUnique({
      where: { id: externalMatchId },
    });

    if (!match) {
      throw new NotFoundException('External match not found');
    }

    return this.getFusedMatchData(match);
  }

  async getNextFusedFixtures(
    league: number,
    next = 10,
  ): Promise<FusedMatchData[]> {
    // 1. Busca próximos jogos via API Sports
    const fixtures = await this.apiSportsService.getNextFixtures(
      league,
      undefined,
      next,
    );

    if (!fixtures?.response?.length) {
      return [];
    }

    // 2. Busca ExternalMatch correspondente no banco
    // CORREÇÃO: Alterado 'tsdbFixtureId' para 'apiSportsEventId' ou 'tsdbEventId'
    // conforme seu Schema Prisma e a origem dos dados (fixtures da API Sports)
    const externalMatches = await this.prisma.externalMatch.findMany({
      where: {
        apiSportsEventId: {
          in: fixtures.response.map((f) => f.fixture.id.toString()),
        },
      },
    });

    // 3. Fusão
    // Resolvemos as promessas de fusão para cada match encontrado
    return Promise.all(
      externalMatches.map((match) => this.getFusedMatchData(match)),
    );
  }
}
