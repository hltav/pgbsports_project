import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, RolesGuard, Roles } from './../../../../libs';
import { BankrollStatsService } from '../services/bankrollStats.service';

interface RequestWithUser extends Request {
  user: {
    id: number;
  };
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER', 'TEST_USER')
export class BankrollStatsController {
  constructor(private readonly statsService: BankrollStatsService) {}

  //Retorna as estatísticas completas de um bankroll
  @Get()
  async getBankrollStats(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.statsService.getBankrollStats(bankrollId, userId);
  }

  //Retorna apenas as informações de streaks de um bankroll
  //Útil se você quiser um endpoint separado apenas para streaks
  @Get('streaks')
  async getBankrollStreaks(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    const stats = await this.statsService.getBankrollStats(bankrollId, userId);

    return {
      currentStreak: stats.currentStreak,
      longestWinStreak: stats.longestWinStreak,
      longestLoseStreak: stats.longestLoseStreak,
    };
  }
}
