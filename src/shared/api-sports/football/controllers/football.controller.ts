import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { FootballService } from '../services/football.service';
import {
  GetStandingsSchema,
  GetStandingsDto,
} from '../schemas/getStandings.dto';
import { GetTeamsSchema, GetTeamsDto } from '../schemas/getTeams.dto';

@Controller('football')
export class FootballController {
  constructor(private readonly footballService: FootballService) {}

  @Get('live-matches')
  async getLiveMatches() {
    return this.footballService.getLiveMatches();
  }

  @Get('leagues')
  async getLeagues() {
    return this.footballService.getLeagues();
  }

  @Get('teams')
  async getTeams(@Query() query: any) {
    const result = GetTeamsSchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }
    const params: GetTeamsDto = result.data;
    return this.footballService.getTeams(params.league, params.season);
  }

  @Get('standings')
  async getStandings(@Query() query: any) {
    const result = GetStandingsSchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }
    const params: GetStandingsDto = result.data;
    return this.footballService.getStandings(params.league, params.season);
  }
}
