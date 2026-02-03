import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './../../../libs/database';
import { Bets } from '@prisma/client';
import { SoccerService } from '../../../shared/api-sports/api/soccer/services/soccer.service';
import { CreateMatchService } from './../../../modules/matchs/services/createMatchs.service';
import { mapStrStatusToMatchStatus } from './../../../shared/thesportsdb-api/helpers/mapStatusToEvent.helper';

interface MatchCriteria {
  homeTeam: string;
  awayTeam: string;
  league: string;
  eventDate: Date;
}

@Injectable()
export class MatchLinkingService {
  private readonly logger = new Logger(MatchLinkingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly soccerService: SoccerService,
    private readonly createMatchService: CreateMatchService,
  ) {}

  /**
   * Processa apostas sem ExternalMatch vinculado
   * Busca na API-Sports e cria o match se encontrar correspondência
   */
  async processPendingBets(limit = 50): Promise<void> {
    this.logger.log(
      `🔍 Iniciando processamento de apostas pendentes (limite: ${limit})`,
    );

    // Busca apostas sem externalMatchId e com dados mínimos necessários
    const pendingBets = await this.prisma.bets.findMany({
      where: {
        homeTeam: { not: null },
        awayTeam: { not: null },
        eventDate: { not: null },
        sport: 'Soccer', // Por enquanto só futebol
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    if (pendingBets.length === 0) {
      this.logger.log('✅ Nenhuma aposta pendente para processar');
      return;
    }

    this.logger.log(
      `📋 ${pendingBets.length} apostas encontradas para processar`,
    );

    for (const bet of pendingBets) {
      try {
        await this.linkBetToMatch(bet);
      } catch (error) {
        this.logger.error(
          `❌ Erro ao processar bet ${bet.id}: ${error}`,
          error,
        );
      }
    }

    this.logger.log('✅ Processamento concluído');
  }

  /**
   * Processa uma aposta específica
   */
  async linkBetToMatch(bet: Bets): Promise<void> {
    if (!bet.homeTeam || !bet.awayTeam || !bet.eventDate) {
      this.logger.warn(`⚠️  Bet ${bet.id} sem dados suficientes para matching`);
      return;
    }

    const criteria: MatchCriteria = {
      homeTeam: bet.homeTeam,
      awayTeam: bet.awayTeam,
      league: bet.league,
      eventDate: bet.eventDate,
    };

    this.logger.log(
      `🔎 Buscando match para bet ${bet.id}: ${criteria.homeTeam} vs ${criteria.awayTeam}`,
    );

    // 1. Verifica se já existe ExternalMatch compatível no banco
    const existingMatch = await this.findExistingMatch(criteria);
    if (existingMatch) {
      await this.linkBet(bet.id, existingMatch.id);
      this.logger.log(
        `✅ Bet ${bet.id} vinculada ao match existente ${existingMatch.id}`,
      );
      return;
    }

    // 2. Busca na API-Sports
    const apiMatch = await this.searchApiSportsMatch(criteria);
    if (!apiMatch) {
      this.logger.warn(
        `⚠️  Nenhum match encontrado na API-Sports para bet ${bet.id}`,
      );
      return;
    }

    // 3. Cria o ExternalMatch
    const newMatch = await this.createMatchService.create({
      apiSportsEventId: apiMatch.fixture.id.toString(),
      tsdbEventId: null,
      apiSource: 'api-sports',
      sport: 'Soccer',
      league: apiMatch.league.name,
      leagueBadge: apiMatch.league.logo,
      leagueId: apiMatch.league.id.toString(),
      season: apiMatch.league.season?.toString() || null,
      round: apiMatch.league.round ? parseInt(apiMatch.league.round) : null,
      country: apiMatch.league.country || null,
      homeTeam: apiMatch.teams.home.name,
      awayTeam: apiMatch.teams.away.name,
      homeTeamBadge: apiMatch.teams.home.logo || null,
      awayTeamBadge: apiMatch.teams.away.logo || null,
      homeScoreHT: apiMatch.score.halftime.home,
      awayScoreHT: apiMatch.score.halftime.away,
      homeScoreFT: apiMatch.score.fulltime.home,
      awayScoreFT: apiMatch.score.fulltime.away,
      status: mapStrStatusToMatchStatus(apiMatch.fixture.status.short),
      eventDate: new Date(apiMatch.fixture.date),
      eventDateLocal: null,
      timezone: apiMatch.fixture.timezone,
      isPostponed: ['PST', 'CANC'].includes(apiMatch.fixture.status.short),
      thumbnail: null,
      venue: apiMatch.fixture.venue?.name || null,
    });

    // 4. Vincula a aposta ao match criado
    await this.linkBet(bet.id, newMatch.id);
    this.logger.log(`✅ Bet ${bet.id} vinculada ao novo match ${newMatch.id}`);
  }

  /**
   * Busca match existente no banco baseado nos critérios
   */
  private async findExistingMatch(criteria: MatchCriteria) {
    const startDate = new Date(criteria.eventDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(criteria.eventDate);
    endDate.setHours(23, 59, 59, 999);

    return this.prisma.externalMatch.findFirst({
      where: {
        homeTeam: { contains: criteria.homeTeam, mode: 'insensitive' },
        awayTeam: { contains: criteria.awayTeam, mode: 'insensitive' },
        league: { contains: criteria.league, mode: 'insensitive' },
        eventDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  /**
   * Busca match na API-Sports usando critérios de matching
   */
  private async searchApiSportsMatch(criteria: MatchCriteria) {
    const dateStr = criteria.eventDate.toISOString().split('T')[0]; // YYYY-MM-DD

    try {
      const response = await this.soccerService.getFixturesByDate(dateStr);

      if (!response?.response?.length) {
        return null;
      }

      // Matching fuzzy por nome dos times
      const match = response.response.find((fixture) => {
        const homeMatch = this.fuzzyMatch(
          fixture.teams.home.name,
          criteria.homeTeam,
        );
        const awayMatch = this.fuzzyMatch(
          fixture.teams.away.name,
          criteria.awayTeam,
        );
        const leagueMatch = this.fuzzyMatch(
          fixture.league.name,
          criteria.league,
        );

        return homeMatch && awayMatch && leagueMatch;
      });

      return match || null;
    } catch (error) {
      this.logger.error(`Erro ao buscar fixtures na API-Sports: ${error}`);
      return null;
    }
  }

  /**
   * Matching fuzzy simples - pode ser melhorado com libs como fuzzball
   */
  private fuzzyMatch(str1: string, str2: string): boolean {
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]/g, ''); // Remove caracteres especiais

    const n1 = normalize(str1);
    const n2 = normalize(str2);

    // Match exato após normalização
    if (n1 === n2) return true;

    // Match por inclusão (para casos como "FC Barcelona" vs "Barcelona")
    if (n1.includes(n2) || n2.includes(n1)) return true;

    // Similaridade básica (pode ser melhorada)
    const minLength = Math.min(n1.length, n2.length);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const maxLength = Math.max(n1.length, n2.length);
    const commonPrefix = this.getCommonPrefix(n1, n2);

    return commonPrefix.length >= minLength * 0.7; // 70% de similaridade
  }

  private getCommonPrefix(str1: string, str2: string): string {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return str1.slice(0, i);
  }

  /**
   * Vincula bet ao match
   */
  private async linkBet(betId: number, matchId: number): Promise<void> {
    await this.prisma.bets.update({
      where: { id: betId },
      data: { externalMatchId: matchId },
    });
  }
}
