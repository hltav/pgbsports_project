// import { Injectable, Logger } from '@nestjs/common';
// import { PrismaService } from '../../../../libs/database/prisma';
// import { Result } from '@prisma/client';

// @Injectable()
// export class FirstHalfSettlementService {
//   private readonly logger = new Logger(FirstHalfSettlementService.name);

//   constructor(private readonly prisma: PrismaService) {}

//   /**
//    * Liquida apostas de 1º tempo quando o evento chega ao intervalo.
//    * Atualiza o placar HT no banco e define o resultado conforme a condição.
//    */
//   async settleFirstHalfBets(
//     apiEventId: string,
//     homeScoreHT: number,
//     awayScoreHT: number,
//   ): Promise<void> {
//     // 🔹 Atualiza o placar HT no evento
//     const updateResult = await this.prisma.event.updateMany({
//       where: { apiEventId },
//       data: { homeScoreHT, awayScoreHT },
//     });
//     this.logger.debug(`${updateResult.count} evento(s) atualizado(s)`);
//     // 🔹 Busca apostas pendentes desse evento que sejam de 1º tempo
//     const bets = await this.prisma.event.findMany({
//       where: {
//         apiEventId,
//         result: Result.pending,
//         OR: [
//           { market: { contains: '1º Tempo', mode: 'insensitive' } },
//           { market: { contains: '1H', mode: 'insensitive' } },
//           { market: { contains: 'First Half', mode: 'insensitive' } },
//         ],
//       },
//     });

//     if (bets.length === 0) {
//       this.logger.debug(`Nenhuma aposta de 1º tempo para ${apiEventId}`);
//       return;
//     }

//     for (const bet of bets) {
//       let result: Result = Result.void;
//       const totalGolsHT = homeScoreHT + awayScoreHT;

//       try {
//         // 🧠 Mercado de vencedor do 1º tempo
//         if (bet.market.includes('Vencedor 1º Tempo')) {
//           if (
//             homeScoreHT > awayScoreHT &&
//             bet.optionMarket?.toLowerCase().includes('casa')
//           )
//             result = Result.win;
//           else if (
//             awayScoreHT > homeScoreHT &&
//             bet.optionMarket?.toLowerCase().includes('fora')
//           )
//             result = Result.win;
//           else if (
//             homeScoreHT === awayScoreHT &&
//             bet.optionMarket?.toLowerCase().includes('empate')
//           )
//             result = Result.win;
//           else result = Result.lose;
//         }

//         // ⚽ Mercado de gols no 1º tempo (Over/Under)
//         if (
//           bet.market.includes('Gols 1º Tempo') ||
//           bet.market.includes('Over/Under 1H')
//         ) {
//           const match = bet.optionMarket?.match(/(\d+(\.\d+)?)/);
//           const linha = match ? parseFloat(match[1]) : null;

//           if (linha != null) {
//             if (
//               bet.optionMarket?.toLowerCase().includes('mais') &&
//               totalGolsHT > linha
//             )
//               result = Result.win;
//             else if (
//               bet.optionMarket?.toLowerCase().includes('menos') &&
//               totalGolsHT < linha
//             )
//               result = Result.win;
//             else result = Result.lose;
//           }
//         }

//         if (bet.market.includes('Ambas marcam 1º Tempo')) {
//           const ambasMarcam = homeScoreHT > 0 && awayScoreHT > 0;
//           if (
//             (ambasMarcam && bet.optionMarket?.toLowerCase().includes('sim')) ||
//             (!ambasMarcam && bet.optionMarket?.toLowerCase().includes('não'))
//           ) {
//             result = Result.win;
//           } else {
//             result = Result.lose;
//           }
//         }

//         // 🔹 Atualiza resultado da aposta
//         await this.prisma.event.update({
//           where: { id: bet.id },
//           data: { result },
//         });

//         this.logger.log(
//           `💰 Evento ${bet.event} (${bet.market} - ${bet.optionMarket}) liquidado como ${result}`,
//         );
//       } catch (error) {
//         this.logger.error(
//           `Erro ao liquidar aposta ${bet.id} (${bet.market}): ${error}`,
//         );
//       }
//     }
//   }
// }

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../libs/database/prisma';
import { Result, Event } from '@prisma/client';

@Injectable()
export class FirstHalfSettlementService {
  private readonly logger = new Logger(FirstHalfSettlementService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Liquida apostas de 1º tempo quando o evento chega ao intervalo.
   * Atualiza o placar HT no banco e define o resultado conforme a condição.
   */
  async settleFirstHalfBets(
    apiEventId: string,
    homeScoreHT: number,
    awayScoreHT: number,
  ): Promise<void> {
    // 🔹 Atualiza o placar HT no evento
    const updateResult = await this.prisma.event.updateMany({
      where: { apiEventId },
      data: { homeScoreHT, awayScoreHT },
    });

    this.logger.debug(
      `✅ ${updateResult.count} evento(s) atualizado(s) | Placar HT: ${homeScoreHT}x${awayScoreHT}`,
    );

    // 🔹 Busca apostas pendentes desse evento que sejam de 1º tempo
    const bets = await this.prisma.event.findMany({
      where: {
        apiEventId,
        result: Result.pending,
        OR: [
          { market: { contains: '1º Tempo', mode: 'insensitive' } },
          { market: { contains: '1H', mode: 'insensitive' } },
          { market: { contains: 'First Half', mode: 'insensitive' } },
          { market: { contains: 'HT', mode: 'insensitive' } },
        ],
      },
    });

    if (bets.length === 0) {
      this.logger.debug(`ℹ️ Nenhuma aposta de 1º tempo para ${apiEventId}`);
      return;
    }

    this.logger.log(`📊 Liquidando ${bets.length} aposta(s) de 1º tempo...`);

    let successCount = 0;
    let errorCount = 0;

    for (const bet of bets) {
      try {
        const result = this.evaluateFirstHalfBet(bet, homeScoreHT, awayScoreHT);

        // 🔹 Atualiza resultado da aposta
        await this.prisma.event.update({
          where: { id: bet.id },
          data: { result },
        });

        successCount++;

        const emoji =
          result === Result.win ? '✅' : result === Result.lose ? '❌' : '🔄';
        this.logger.log(
          `${emoji} #${bet.id} | ${bet.event} | ${bet.market} (${bet.optionMarket}) → ${result.toUpperCase()} | HT: ${homeScoreHT}x${awayScoreHT}`,
        );
      } catch (error) {
        errorCount++;
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido';
        this.logger.error(
          `❌ Erro ao liquidar aposta #${bet.id} (${bet.market}): ${errorMessage}`,
        );
      }
    }

    this.logger.log(
      `📈 Liquidação concluída: ${successCount} sucesso(s), ${errorCount} erro(s)`,
    );
  }

  /**
   * Avalia o resultado de uma aposta de primeiro tempo
   */
  private evaluateFirstHalfBet(
    bet: Event,
    homeScoreHT: number,
    awayScoreHT: number,
  ): Result {
    const market = bet.market.toLowerCase();
    const option = (bet.optionMarket || '').toLowerCase();
    const totalGolsHT = homeScoreHT + awayScoreHT;

    // 🏆 Vencedor do 1º Tempo (1X2)
    if (
      market.includes('vencedor') ||
      market.includes('resultado') ||
      market.includes('moneyline') ||
      market.includes('match result')
    ) {
      if (
        option.includes('casa') ||
        option.includes('home') ||
        option === '1'
      ) {
        return homeScoreHT > awayScoreHT ? Result.win : Result.lose;
      }
      if (
        option.includes('empate') ||
        option.includes('draw') ||
        option === 'x'
      ) {
        return homeScoreHT === awayScoreHT ? Result.win : Result.lose;
      }
      if (
        option.includes('fora') ||
        option.includes('away') ||
        option === '2'
      ) {
        return awayScoreHT > homeScoreHT ? Result.win : Result.lose;
      }
    }

    // ⚽ Over/Under de Gols no 1º Tempo
    if (
      market.includes('gols') ||
      market.includes('over') ||
      market.includes('under') ||
      market.includes('acima') ||
      market.includes('abaixo') ||
      market.includes('total')
    ) {
      const linha = this.extractLine(option);

      if (linha !== null) {
        const isOver =
          option.includes('mais') ||
          option.includes('over') ||
          option.includes('acima');
        const isUnder =
          option.includes('menos') ||
          option.includes('under') ||
          option.includes('abaixo');

        if (isOver) {
          return totalGolsHT > linha ? Result.win : Result.lose;
        }
        if (isUnder) {
          return totalGolsHT < linha ? Result.win : Result.lose;
        }
      }
    }

    // 🎯 Ambas Marcam no 1º Tempo
    if (
      market.includes('ambas') ||
      market.includes('btts') ||
      market.includes('both teams')
    ) {
      const ambasMarcam = homeScoreHT > 0 && awayScoreHT > 0;
      const apostouSim = option.includes('sim') || option.includes('yes');
      const apostouNao =
        option.includes('não') ||
        option.includes('nao') ||
        option.includes('no');

      if (apostouSim) {
        return ambasMarcam ? Result.win : Result.lose;
      }
      if (apostouNao) {
        return ambasMarcam ? Result.lose : Result.win;
      }
    }

    // ⚖️ Handicap Asiático 1º Tempo
    if (market.includes('handicap') || market.includes('ah')) {
      const handicap = this.extractHandicap(option);

      if (handicap !== null) {
        const teamHome = option.includes('casa') || option.includes('home');
        const adjustedScore = teamHome
          ? homeScoreHT + handicap - awayScoreHT
          : awayScoreHT + handicap - homeScoreHT;

        if (adjustedScore > 0) return Result.win;
        if (adjustedScore < 0) return Result.lose;
        return Result.returned; // Empate no handicap = devolução
      }
    }

    // 🔢 Total de Gols Exatos no 1º Tempo
    if (market.includes('exato') || market.includes('exact')) {
      const goalsExpected = this.extractLine(option);
      if (goalsExpected !== null) {
        return totalGolsHT === goalsExpected ? Result.win : Result.lose;
      }
    }

    // ⚠️ Mercado não reconhecido
    this.logger.warn(
      `⚠️ Mercado de 1º tempo não reconhecido: "${bet.market}" - "${bet.optionMarket}"`,
    );
    return Result.void;
  }

  /**
   * Extrai a linha de gols de uma string (ex: "Mais de 1.5" → 1.5)
   */
  private extractLine(text: string): number | null {
    const match = text.match(/(\d+[.,]?\d*)/);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
    return null;
  }

  /**
   * Extrai o handicap de uma string (ex: "Casa -0.5" → -0.5)
   */
  private extractHandicap(text: string): number | null {
    const match = text.match(/([+-]?\d+[.,]?\d*)/);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
    return null;
  }
}
