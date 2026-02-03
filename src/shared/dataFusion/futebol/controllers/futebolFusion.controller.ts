import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { FutebolFusionService } from '../services/futebolFusion.service';

@Controller('soccer/fusion')
export class FutebolFusionController {
  constructor(private readonly fusionService: FutebolFusionService) {}

  @Get('fixtures/:externalMatchId')
  async getFusedMatch(@Param('externalMatchId') externalMatchId: number) {
    return this.fusionService.getFusedMatchByExternalMatchId(externalMatchId);
  }

  @Get('fixtures/next')
  async getNextFusedFixtures(
    @Query('league', ParseIntPipe) league: number,
    @Query('next') next = 10,
  ) {
    return this.fusionService.getNextFusedFixtures(league, next);
  }
}
