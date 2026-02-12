import { Injectable, Logger } from '@nestjs/common';
import { Result, Bets, MatchStatus } from '@prisma/client';
import { EventsService } from './../../../modules';
import { EventLiveScoreDTO } from './../../../shared/thesportsdb-api/schemas/live/eventLiveScore.schema';
import {
  analyzeAmbasMarcam,
  analyzeAmbasMarcamEmAmbosTempos,
  analyzeAmbasMarcamPrimeiroTempo,
  analyzeDuplaChance,
  analyzeEmpateAnulaAposta,
  analyzeEquipeMarca,
  analyzeGolsPrimeiroTempo,
  analyzeGolsSegundoTempo,
  analyzeHandicapAsiatico,
  analyzeHandicapEuropeuBinary,
  analyzeHandicapPorTempo,
  analyzeIntervaloFinal,
  analyzeNumeroParImpar,
  analyzePlacarExatoImproved,
  analyzeResultadoFinal,
  analyzeTotalExatoGols,
  analyzeTotalGols,
  analyzeVencedor2oTempo,
  analyzeVencedorPrimeiroTempo,
  analyzeVenceSemSofrerGol,
  EventMarketAnalysis,
} from '../analysis';
import { CalculateARService } from './bet-settlement/settlement/calculate.service';
import { CanFinalizeBetService } from './bet-settlement/settlement/canFinalize.service';

@Injectable()
export class BetSettlementService {
  private readonly logger = new Logger(BetSettlementService.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly calculateARService: CalculateARService,
    private readonly canFinalizeBet: CanFinalizeBetService,
  ) {}

  async settleBet(
    bet: Bets,
    eventData: EventLiveScoreDTO,
    analysis: EventMarketAnalysis,
  ): Promise<boolean> {
    const eventStatus = eventData.strStatus as MatchStatus;

    if (!this.canFinalizeBet.canFinalizeBet(bet, eventStatus, analysis)) {
      return false;
    }

    const actualReturn = this.calculateARService.calculateActualReturn(
      bet,
      analysis.result,
    );

    await this.eventsService.updateBet({
      id: bet.id,
      userId: bet.userId,
      result: analysis.result,
      actualReturn,
      settledAt: new Date(),
    });

    this.logger.log(
      `✓ Bet ${bet.id} settled → ${analysis.result} | ` +
        `Return preserved: R$ ${bet.actualReturn?.toFixed(2)}`,
    );

    return true;
  }

  //Analisa o resultado da aposta com base no mercado e placar
  public analyzeEventResult(eventData: EventLiveScoreDTO): EventMarketAnalysis {
    const homeScore = parseInt(eventData.intHomeScore || '0', 10);
    const awayScore = parseInt(eventData.intAwayScore || '0', 10);
    const market = eventData.market;
    const selection = eventData.selection;

    const homeScoreHT = eventData.homeScoreHT ?? 0;
    const awayScoreHT = eventData.awayScoreHT ?? 0;
    const eventStatus = eventData.strStatus as MatchStatus;

    this.logger.debug(
      `Analyzing bet: market="${market}", selection="${selection}", ` +
        `FT=${homeScore}-${awayScore}, HT=${homeScoreHT}-${awayScoreHT}, ` +
        `status=${eventStatus}`,
    );

    // --------------------- MERCADOS DE TEMPO ---------------------

    if (market.includes('Gols 1º Tempo') || market.includes('1st Half Goals'))
      return analyzeGolsPrimeiroTempo(
        selection,
        homeScoreHT,
        awayScoreHT,
        eventStatus,
      );

    if (market.includes('Gols 2º Tempo') || market.includes('2nd Half Goals'))
      return analyzeGolsSegundoTempo(
        selection,
        homeScoreHT,
        awayScoreHT,
        homeScore,
        awayScore,
        eventStatus,
      );

    if (
      market.includes('Vencedor 1º Tempo') ||
      market.includes('1st Half Winner') ||
      market.includes('Resultado do 1º Tempo')
    )
      return analyzeVencedorPrimeiroTempo(
        selection,
        homeScoreHT,
        awayScoreHT,
        eventStatus,
      );

    if (
      market.includes('Ambas Marcam 1º Tempo') ||
      market.includes('BTTS 1st Half')
    )
      return analyzeAmbasMarcamPrimeiroTempo(
        selection,
        homeScoreHT,
        awayScoreHT,
        eventStatus,
      );

    if (
      market.includes('Ambas Marcam Ambos Tempos') ||
      market.includes('BTTS Both Halves')
    )
      return analyzeAmbasMarcamEmAmbosTempos(
        selection,
        homeScoreHT,
        awayScoreHT,
        homeScore,
        awayScore,
        eventStatus,
      );

    if (market.includes('Intervalo/Final') || market.includes('HT/FT'))
      return analyzeIntervaloFinal(
        selection,
        homeScoreHT,
        awayScoreHT,
        homeScore,
        awayScore,
        eventStatus,
      );

    if (
      market.includes('Vencedor 2º Tempo') ||
      market.includes('2nd Half Winner') ||
      market.includes('Resultado do 2º Tempo')
    ) {
      return analyzeVencedor2oTempo(
        selection,
        homeScoreHT,
        awayScoreHT,
        homeScore,
        awayScore,
        eventStatus,
      );
    }

    // --------------------- MERCADOS DE TEMPO COMPLETO ---------------------

    if (market.includes('Resultado Final'))
      return analyzeResultadoFinal(
        selection,
        homeScore,
        awayScore,
        eventStatus,
      );

    if (
      market.includes('Ambas Marcam') &&
      !market.includes('1º Tempo') &&
      !market.includes('Ambos Tempos')
    )
      return analyzeAmbasMarcam(selection, homeScore, awayScore, eventStatus);

    if (
      market.includes('Vence sem sofrer gol') ||
      market.includes('Win to Nil') ||
      market.includes('Clean Sheet')
    )
      return analyzeVenceSemSofrerGol(
        selection,
        homeScore,
        awayScore,
        eventStatus,
      );

    if (
      market.includes('Par ou Ímpar') ||
      market.includes('Gols Par') ||
      market.includes('Gols Ímpar') ||
      market.includes('Even Odd')
    )
      return analyzeNumeroParImpar(
        selection,
        homeScore,
        awayScore,
        eventStatus,
      );

    if (
      market.includes('Total Exato') ||
      market.includes('Exact Total') ||
      market.includes('Total de Gols Exato')
    )
      return analyzeTotalExatoGols(
        selection,
        homeScore,
        awayScore,
        eventStatus,
      );

    if (
      market.includes('Handicap Asiático') ||
      market.includes('Asian Handicap')
    )
      return analyzeHandicapAsiatico(
        selection,
        homeScore,
        awayScore,
        eventStatus,
      );

    if (
      market.includes('Handicap Europeu') ||
      market.includes('European Handicap') ||
      (market.includes('Handicap') && !market.includes('Tempo'))
    )
      return analyzeHandicapEuropeuBinary(
        selection,
        homeScore,
        awayScore,
        eventStatus,
      );

    if (market.includes('Handicap') && market.includes('Tempo')) {
      const scores =
        market.includes('1º Tempo') || market.includes('1st Half')
          ? {
              homeScore: homeScoreHT,
              awayScore: awayScoreHT,
              period: 'HT' as const,
            }
          : {
              homeScore: homeScore - homeScoreHT,
              awayScore: awayScore - awayScoreHT,
              period: '2H' as const,
            };

      return analyzeHandicapPorTempo(
        selection,
        scores.homeScore,
        scores.awayScore,
        eventStatus,
        scores.period,
      );
    }

    if (market.includes('Placar Exato') || market.includes('Correct Score')) {
      return analyzePlacarExatoImproved(
        selection,
        homeScore,
        awayScore,
        eventStatus,
      );
    }

    if (market.includes('Dupla Chance') || market.includes('Double Chance'))
      return analyzeDuplaChance(selection, homeScore, awayScore, eventStatus);

    if (
      market.includes('Empate Anula') ||
      market.includes('Draw No Bet') ||
      market.includes('DNB')
    )
      return analyzeEmpateAnulaAposta(
        selection,
        homeScore,
        awayScore,
        eventStatus,
      );

    // --------------------- MERCADOS DE GOLS ---------------------

    if (
      market.includes('Total de Gols') ||
      market.includes('Gols (Over/Under)')
    )
      return analyzeTotalGols(selection, homeScore, awayScore, eventStatus);

    // 🔧 FIX 3: BTTS agora tem fallback explícito
    if (market.includes('Ambas Marcam (BTTS)')) {
      return analyzeAmbasMarcam(selection, homeScore, awayScore, eventStatus);
    }

    if (market.includes('Equipe Marca')) {
      return analyzeEquipeMarca(selection, homeScore, awayScore, eventStatus);
    }

    // Mercado não reconhecido
    this.logger.warn(
      `⚠️ Market not recognized: "${market}" | Selection: "${selection}" | Marking as void`,
    );
    return { result: Result.void, shouldUpdate: true };
  }
}
