import { Injectable } from '@nestjs/common';
import { SportsApiService } from '../../api/sports-api.service';
import { FixturesResponse } from '../schemas/fixtures/fixtures.schema';
import { LeaguesResponse } from '../schemas/leagues/leagues.schema';
import { TeamsResponse } from '../schemas/teams/teams-response.schema';
import { StandingsResponse } from '../schemas/standings/standing.schema';

@Injectable()
export class FootballService {
  constructor(private readonly sportsApiService: SportsApiService) {}

  getLiveMatches(): Promise<FixturesResponse> {
    return this.sportsApiService.get<FixturesResponse>('/fixtures', {
      live: 'all',
    });
  }

  getLeagues(): Promise<LeaguesResponse> {
    return this.sportsApiService.get<LeaguesResponse>('/leagues');
  }

  getTeams(leagueId: number, season: number): Promise<TeamsResponse> {
    return this.sportsApiService.get<TeamsResponse>('/teams', {
      league: leagueId,
      season,
    });
  }

  getStandings(leagueId: number, season: number): Promise<StandingsResponse> {
    return this.sportsApiService.get<StandingsResponse>('/standings', {
      league: leagueId,
      season,
    });
  }
}
