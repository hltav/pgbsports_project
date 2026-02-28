import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FutebolFusionService } from '../services/futebolFusion.service';
import { JwtAuthGuard, RolesGuard } from './../../../../libs';

@Controller('soccer/fusion')
@UseGuards(JwtAuthGuard, RolesGuard)
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
