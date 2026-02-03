import {
  Controller,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './../../../libs';
import { MatchLinkingService } from '../services/matchLinking.service';

@Controller('match-linking')
@UseGuards(JwtAuthGuard)
export class MatchLinkingController {
  constructor(private readonly matchLinkingService: MatchLinkingService) {}

  /**
   * Trigger manual para processar apostas pendentes
   * POST /match-linking/process
   */
  @Post('process')
  async processPending() {
    await this.matchLinkingService.processPendingBets(100);
    return { message: 'Processamento iniciado' };
  }

  /**
   * Processa uma aposta específica
   * POST /match-linking/bet/:id
   */
  @Post('bet/:id')
  async processBet(@Param('id', ParseIntPipe) betId: number) {
    const bet = await this.matchLinkingService['prisma'].bets.findUnique({
      where: { id: betId },
    });

    if (!bet) {
      return { message: 'Aposta não encontrada' };
    }

    await this.matchLinkingService.linkBetToMatch(bet);
    return { message: `Aposta ${betId} processada` };
  }
}
