import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  GetStandingsSchema,
  GetStandingsDto,
} from '../schemas/getStandings.dto';
import { GetTeamsSchema, GetTeamsDto } from '../schemas/getTeams.dto';
import { JwtAuthGuard, RolesGuard } from '../../../../../libs';
import {
  GetFixturesSchema,
  GetFixturesDto,
} from '../schemas/fixtures/getFixtures.dto';
import { ZodValidationPipe } from '../../../../../libs/utils/zodValidation.pipe';
import { SoccerService } from '../services/soccer.service';

export interface SimplifiedLeagueResponse {
  get: string;
  parameters: any;
  errors: any[];
  results: number;
  paging: { current: number; total: number };
  response: Array<{
    league: { id: number; name: string };
    country: { name: string };
  }>;
}

@Controller('soccer')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SoccerController {
  constructor(private readonly soccerService: SoccerService) {}

  @Get('live-matches')
  async getLiveMatches() {
    return this.soccerService.getLiveMatches();
  }

  @Get('leagues')
  async getLeagues() {
    return this.soccerService.getLeagues();
  }

  @Get('leagues/simplified')
  async getSimplifiedLeagues(): Promise<SimplifiedLeagueResponse> {
    return this.soccerService.getSimplifiedLeagues();
  }

  @Get('fixtures/next')
  async getNextFixtures(
    @Query(new ZodValidationPipe<GetFixturesDto>(GetFixturesSchema))
    params: GetFixturesDto,
  ) {
    return this.soccerService.getNextFixtures(
      params.league,
      params.season,
      params.next,
    );
  }

  @Get('teams')
  async getTeams(
    @Query(new ZodValidationPipe<GetTeamsDto>(GetTeamsSchema))
    params: GetTeamsDto,
  ) {
    return this.soccerService.getTeams(params.league, params.season);
  }

  @Get('standings')
  async getStandings(
    @Query(new ZodValidationPipe<GetStandingsDto>(GetStandingsSchema))
    params: GetStandingsDto,
  ) {
    return this.soccerService.getStandings(params.league, params.season);
  }
}
