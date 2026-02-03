import { Injectable, Logger } from '@nestjs/common';
import { BetWithExternalMatch } from '../types/betWithExternal.types';
import { MatchStatus, Result } from '@prisma/client';
import { EventLiveScoreDTO } from './../../../../../shared/thesportsdb-api/schemas/live/eventLiveScore.schema';
import { BetSettlementService } from '../../betSettlement.service';

@Injectable()
export class SingleBetService {
  private readonly logger = new Logger(SingleBetService.name);

  constructor(private readonly settlementService: BetSettlementService) {}

  async settleSingleBet(
    bet: BetWithExternalMatch,
    scores: {
      homeScore: number;
      awayScore: number;
      homeScoreHT: number;
      awayScoreHT: number;
      canonicalStatus: MatchStatus;
    },
  ): Promise<Result | null> {
    const eventData: EventLiveScoreDTO = {
      ...bet,
      intHomeScore: scores.homeScore.toString(),
      intAwayScore: scores.awayScore.toString(),
      strStatus: scores.canonicalStatus,
      homeScoreHT: scores.homeScoreHT,
      awayScoreHT: scores.awayScoreHT,
      homeScoreFT: scores.homeScore,
      awayScoreFT: scores.awayScore,
      optionMarket: bet.selection,
    } as EventLiveScoreDTO;

    // Validar dados
    const validation = this.settlementService.validateEventData(eventData);
    if (!validation.isValid) {
      this.logger.warn(
        `Bet ${bet.id} has invalid event data: ${validation.reason}`,
      );
      return null;
    }

    // Analisar resultado
    const analysis = this.settlementService.analyzeEventResult(eventData);

    // Liquidar (o settleBet já verifica internamente se pode finalizar)
    const finalized = await this.settlementService.settleBet(
      bet,
      eventData,
      analysis,
    );

    return finalized ? analysis.result : null;
  }
}
