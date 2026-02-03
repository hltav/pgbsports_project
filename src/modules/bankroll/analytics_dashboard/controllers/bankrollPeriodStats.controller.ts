import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles } from './../../../../libs';
import { BankrollPeriodStatsService } from '../services/bankrollPeriodStates.service';

@Controller('period')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER', 'TEST_USER')
export class BankrollPeriodStatsController {
  constructor(private readonly statsService: BankrollPeriodStatsService) {}

  @Get(':period')
  async getStats(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Param('period') period: '7d' | '30d' | '90d' | 'all',
  ) {
    return this.statsService.getStats(bankrollId, period);
  }
}
