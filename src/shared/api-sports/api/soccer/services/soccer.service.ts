import { Injectable } from '@nestjs/common';
import { FixturesResponse } from '../schemas/fixtures/fixtures.schema';
import { LeaguesResponse } from '../schemas/leagues/leagues.schema';
import { TeamsResponse } from '../schemas/teams/teams-response.schema';
import { StandingsResponse } from '../schemas/standings/standing.schema';
import { LeagueSeasonService } from '../domain/leagueSeason.service';
import { SoccerApiCachedService } from './soccerApiCached.service';
import { ApiSportsFixturesResponse } from '../schemas/fixtures/apiSportsFixturesResponse.schema';
import { CACHE_TTL } from './../../../../../libs/utils/cache.constants';

@Injectable()
export class SoccerService {
  constructor(
    private readonly sportsApiCachedService: SoccerApiCachedService,
    private readonly leagueSeasonService: LeagueSeasonService,
  ) {}

  async getFixtureById(fixtureId: string): Promise<FixturesResponse> {
    return this.sportsApiCachedService.getWithCache<FixturesResponse>(
      '/fixtures',
      { id: fixtureId },
      CACHE_TTL.ONE_DAY,
    );
  }

  async getFixturesByDate(date: string): Promise<FixturesResponse> {
    // date no formato YYYY-MM-DD
    return this.sportsApiCachedService.getWithCache<FixturesResponse>(
      '/fixtures',
      { date },
    );
  }

  async getNextFixtures(
    league: number,
    season?: number,
    next = 10,
  ): Promise<ApiSportsFixturesResponse> {
    const resolvedSeason =
      season ??
      (await this.leagueSeasonService.getCurrentSeasonForLeague(league));

    return this.sportsApiCachedService.getWithCache<ApiSportsFixturesResponse>(
      '/fixtures',
      {
        league,
        season: resolvedSeason,
        next,
      },
      CACHE_TTL.ONE_DAY,
    );
  }

  getLiveMatches() {
    return this.sportsApiCachedService.getWithCache<FixturesResponse>(
      '/fixtures',
      { live: 'all' },
    );
  }

  getLeagues() {
    return this.sportsApiCachedService.getWithCache<LeaguesResponse>(
      '/leagues',
    );
  }

  async getSimplifiedLeagues() {
    const data = await this.getLeagues();

    // Mapeamos o array 'response' para o formato desejado
    const simplifiedResponse = data.response.map((item) => ({
      league: {
        id: item.league.id,
        name: item.league.name,
      },
      country: {
        name: item.country.name,
      },
    }));

    // Retornamos o objeto com a mesma estrutura de metadados, mas com a resposta simplificada
    return {
      get: data.get,
      parameters: data.parameters,
      errors: data.errors,
      results: data.results,
      paging: data.paging,
      response: simplifiedResponse,
    };
  }

  getTeams(leagueId: number, season: number) {
    return this.sportsApiCachedService.getWithCache<TeamsResponse>('/teams', {
      league: leagueId,
      season,
    });
  }

  getStandings(leagueId: number, season: number) {
    return this.sportsApiCachedService.getWithCache<StandingsResponse>(
      '/standings',
      { league: leagueId, season },
    );
  }
}
