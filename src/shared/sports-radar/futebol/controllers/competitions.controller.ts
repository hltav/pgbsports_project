import { Controller, Get, Param, Query } from '@nestjs/common';
import { CompetitionsService } from '../competitions/competitions.service';

@Controller('sportsradar')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Get('competitions')
  async getCompetitions(@Query('locale') locale: string) {
    return this.competitionsService.getCompetitions(locale);
  }

  @Get('competitions/:competitionId/info')
  async getCompetitionInfo(
    @Query('locale') locale: string,
    @Param('competitionId') competitionId: string,
  ) {
    return this.competitionsService.getCompetitionInfo(locale, competitionId);
  }
}
