import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../libs/database/prisma';
import { Result, Event } from '@prisma/client';

@Injectable()
export class FirstHalfSettlementService {
  private readonly logger = new Logger(FirstHalfSettlementService.name);

  constructor(private readonly prisma: PrismaService) {}

  async settleFirstHalfBets(
    apiEventId: string,
    homeScoreHT: number,
    awayScoreHT: number,
  ): Promise<void> {
    const updateResult = await this.prisma.event.updateMany({
      where: { apiEventId },
      data: { homeScoreHT, awayScoreHT },
    });

    this.logger.debug(
      `✅ ${updateResult.count} evento(s) atualizado(s) | Placar HT: ${homeScoreHT}x${awayScoreHT}`,
    );

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

  private evaluateFirstHalfBet(
    bet: Event,
    homeScoreHT: number,
    awayScoreHT: number,
  ): Result {
    const market = bet.market.toLowerCase();
    const option = (bet.optionMarket || '').toLowerCase();
    const totalGolsHT = homeScoreHT + awayScoreHT;

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

    if (market.includes('handicap') || market.includes('ah')) {
      const handicap = this.extractHandicap(option);

      if (handicap !== null) {
        const teamHome = option.includes('casa') || option.includes('home');
        const adjustedScore = teamHome
          ? homeScoreHT + handicap - awayScoreHT
          : awayScoreHT + handicap - homeScoreHT;

        if (adjustedScore > 0) return Result.win;
        if (adjustedScore < 0) return Result.lose;
        return Result.returned;
      }
    }

    if (market.includes('exato') || market.includes('exact')) {
      const goalsExpected = this.extractLine(option);
      if (goalsExpected !== null) {
        return totalGolsHT === goalsExpected ? Result.win : Result.lose;
      }
    }

    this.logger.warn(
      `⚠️ Mercado de 1º tempo não reconhecido: "${bet.market}" - "${bet.optionMarket}"`,
    );
    return Result.void;
  }

  private extractLine(text: string): number | null {
    const match = text.match(/(\d+[.,]?\d*)/);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
    return null;
  }

  private extractHandicap(text: string): number | null {
    const match = text.match(/([+-]?\d+[.,]?\d*)/);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
    return null;
  }
}
