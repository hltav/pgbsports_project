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
  analyzeGolsPrimeiroTempo,
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
import { Decimal } from './../../../libs/database/prisma/decimal';

@Injectable()
export class BetSettlementService {
  private readonly logger = new Logger(BetSettlementService.name);

  constructor(private readonly eventsService: EventsService) {}

  async settleBet(
    bet: Bets,
    eventData: EventLiveScoreDTO,
    analysis: EventMarketAnalysis,
  ): Promise<boolean> {
    const eventStatus = eventData.strStatus as MatchStatus;

    if (!this.canFinalizeBet(bet, eventStatus, analysis)) {
      return false;
    }

    const actualReturn = this.calculateActualReturn(bet, analysis.result);

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

  private calculateActualReturn(bet: Bets, result: Result): Decimal {
    const stakeUnits = new Decimal(bet.stake); // Ex: 1.00
    const unitValue = new Decimal(bet.unitValue); // Ex: 100.00
    const odd = new Decimal(bet.odd); // Ex: 1.95

    // Valor real investido (Ex: R$ 100.00)
    const monetaryStake = stakeUnits.mul(unitValue);

    switch (result) {
      case Result.win:
        // 1.00 * 100.00 * 1.95 = 195.00
        return monetaryStake.mul(odd);

      case Result.lose:
        return new Decimal(0);

      case Result.void:
      case Result.returned:
        // Devolve o valor monetário integral (R$ 100.00)
        return monetaryStake;

      default:
        return new Decimal(0);
    }
  }

  private canFinalizeBet(
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

  //Analisa o resultado da aposta com base no mercado e placar
  public analyzeEventResult(eventData: EventLiveScoreDTO): EventMarketAnalysis {
    const homeScore = parseInt(eventData.intHomeScore || '0', 10);
    const awayScore = parseInt(eventData.intAwayScore || '0', 10);
    const market = eventData.market;
    const selection = eventData.selection;

    const homeScoreHT = eventData.homeScoreHT ?? 0;
    const awayScoreHT = eventData.awayScoreHT ?? 0;
    const eventStatus = eventData.strStatus as MatchStatus;

    const isFinished = eventStatus === MatchStatus.FINISHED;

    this.logger.debug(
      `Analyzing bet: market="${market}", selection="${selection}", ` +
        `FT=${homeScore}-${awayScore}, HT=${homeScoreHT}-${awayScoreHT}, ` +
        `status=${eventStatus}`,
    );

    // --------------------- MERCADOS DE TEMPO ---------------------

    if (market.includes('Gols 1º Tempo') || market.includes('1st Half Goals'))
      return analyzeGolsPrimeiroTempo(selection, homeScoreHT, awayScoreHT);

    if (
      market.includes('Vencedor 1º Tempo') ||
      market.includes('1st Half Winner') ||
      market.includes('Resultado do 1º Tempo')
    )
      return analyzeVencedorPrimeiroTempo(selection, homeScoreHT, awayScoreHT);

    if (
      market.includes('Ambas Marcam 1º Tempo') ||
      market.includes('BTTS 1st Half')
    )
      return analyzeAmbasMarcamPrimeiroTempo(
        selection,
        homeScoreHT,
        awayScoreHT,
        isFinished,
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
        isFinished,
      );

    if (market.includes('Intervalo/Final') || market.includes('HT/FT'))
      return analyzeIntervaloFinal(
        selection,
        homeScoreHT,
        awayScoreHT,
        homeScore,
        awayScore,
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
        isFinished,
      );
    }

    // --------------------- MERCADOS DE TEMPO COMPLETO ---------------------

    if (market.includes('Resultado Final'))
      return analyzeResultadoFinal(selection, homeScore, awayScore);

    // if (market.includes('Resultado Antecipado'))
    //   return analyzeVencedorAntecipado(
    //     selection,
    //     homeScore,
    //     awayScore,
    //     isFinished,
    //   );

    if (
      market.includes('Total de Gols') ||
      market.includes('Gols (Over/Under)')
    )
      return analyzeTotalGols(selection, homeScore, awayScore);

    // 🔧 FIX 3: BTTS agora tem fallback explícito
    if (market.includes('Ambas as Equipes Marcam (BTTS)')) {
      return analyzeAmbasMarcam(selection, homeScore, awayScore, isFinished);
    }

    if (
      market.includes('Ambas Marcam') &&
      !market.includes('1º Tempo') &&
      !market.includes('Ambos Tempos')
    )
      return analyzeAmbasMarcam(selection, homeScore, awayScore, isFinished);

    if (
      market.includes('Vence Sem Sofrer') ||
      market.includes('Win to Nil') ||
      market.includes('Clean Sheet')
    )
      return analyzeVenceSemSofrerGol(selection, homeScore, awayScore);

    if (
      market.includes('Par ou Ímpar') ||
      market.includes('Gols Par') ||
      market.includes('Gols Ímpar') ||
      market.includes('Even Odd')
    )
      return analyzeNumeroParImpar(selection, homeScore, awayScore);

    if (
      market.includes('Total Exato') ||
      market.includes('Exact Total') ||
      market.includes('Total de Gols Exato')
    )
      return analyzeTotalExatoGols(selection, homeScore, awayScore);

    if (
      market.includes('Handicap Asiático') ||
      market.includes('Asian Handicap')
    )
      return analyzeHandicapAsiatico(selection, homeScore, awayScore);

    if (
      market.includes('Handicap Europeu') ||
      market.includes('European Handicap') ||
      (market.includes('Handicap') && !market.includes('Tempo'))
    )
      return analyzeHandicapEuropeuBinary(selection, homeScore, awayScore);

    if (market.includes('Handicap') && market.includes('Tempo')) {
      const scores =
        market.includes('1º Tempo') || market.includes('1st Half')
          ? { homeScore: homeScoreHT, awayScore: awayScoreHT }
          : {
              homeScore: homeScore - homeScoreHT,
              awayScore: awayScore - awayScoreHT,
            };

      return analyzeHandicapPorTempo(
        selection,
        scores.homeScore,
        scores.awayScore,
      );
    }

    if (market.includes('Placar Exato') || market.includes('Correct Score')) {
      return analyzePlacarExatoImproved(
        selection,
        homeScore,
        awayScore,
        homeScoreHT,
        awayScoreHT,
      );
    }

    if (market.includes('Dupla Chance') || market.includes('Double Chance'))
      return analyzeDuplaChance(selection, homeScore, awayScore);

    if (
      market.includes('Empate Anula') ||
      market.includes('Draw No Bet') ||
      market.includes('DNB')
    )
      return analyzeEmpateAnulaAposta(
        selection,
        homeScore,
        awayScore,
        isFinished,
      );

    // Mercado não reconhecido
    this.logger.warn(
      `⚠️ Market not recognized: "${market}" | Selection: "${selection}" | Marking as void`,
    );
    return { result: Result.void, shouldUpdate: true };
  }

  //Valida se os dados do evento estão completos
  public validateEventData(eventData: EventLiveScoreDTO): {
    isValid: boolean;
    reason?: string;
  } {
    // Verificar se tem placares
    if (
      eventData.intHomeScore === undefined ||
      eventData.intAwayScore === undefined
    ) {
      return { isValid: false, reason: 'Missing final scores' };
    }
    // Verificar se está finalizado e tem placares HT
    const status = eventData.strStatus as MatchStatus;
    if (
      status === MatchStatus.FINISHED &&
      (eventData.homeScoreHT === undefined ||
        eventData.awayScoreHT === undefined)
    ) {
      // Definir placares HT como 0-0 se não tiver (fallback)
      eventData.homeScoreHT = 0;
      eventData.awayScoreHT = 0;
      this.logger.warn(
        `Missing HT scores for finished match, using 0-0 as fallback`,
      );
    }

    return { isValid: true };
  }
}
