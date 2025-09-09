import { Injectable } from '@nestjs/common';
import { SportsApiCachedService } from '../../../api/sportsApiCached.service';
import { FixturesResponse } from '../schemas/fixtures/fixtures.schema';
import { LeaguesResponse } from '../schemas/leagues/leagues.schema';
import { TeamsResponse } from '../schemas/teams/teams-response.schema';
import { StandingsResponse } from '../schemas/standings/standing.schema';

@Injectable()
export class SoccerService {
  constructor(
    private readonly sportsApiCachedService: SportsApiCachedService,
  ) {}

  getLiveMatches() {
    return this.sportsApiCachedService.getWithCache<FixturesResponse>(
      '/fixtures',
      { live: 'all' },
      10_000,
    );
  }

  getLeagues() {
    return this.sportsApiCachedService.getWithCache<LeaguesResponse>(
      '/leagues',
    );
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
