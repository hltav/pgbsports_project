import { Injectable, Logger } from '@nestjs/common';
import { Bets, MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis } from './../../../../../shared/results/analysis';

@Injectable()
export class CanFinalizeBetService {
  private readonly logger = new Logger(CanFinalizeBetService.name);

  constructor() {}

  public canFinalizeBet(
    bet: Bets,
    eventStatus: MatchStatus,
    analysis: EventMarketAnalysis,
  ): boolean {
    if (!analysis.shouldUpdate || bet.result !== Result.pending) {
      return false;
    }

    const isFirstHalfMarket =
      bet.market.includes('1º Tempo') || bet.market.includes('HT');
    // 1. Se a partida terminou, TUDO pode ser finalizado
    if (eventStatus === MatchStatus.FINISHED) {
      return true;
    }
    // 2. Se está no intervalo, mercados de 1º tempo podem ser finalizados
    if (isFirstHalfMarket && eventStatus === MatchStatus.HALF_TIME) {
      return true;
    }
    // 3. Finalização antecipada (ex: Mais de 1.5 gols e já saiu 2 gols no 1º tempo)
    if (analysis.isFinalizableEarly) {
      return true;
    }

    return false;
  }
}
