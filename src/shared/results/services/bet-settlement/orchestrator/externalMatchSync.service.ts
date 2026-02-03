import { Injectable, Logger } from '@nestjs/common';
import { Result, MatchStatus, ExternalMatch } from '@prisma/client';
import { BetWithExternalMatch } from '../types/betWithExternal.types';
import { PrismaService } from './../../../../../libs/database';
import { EventsService } from './../../../../../modules/events/events.service';

@Injectable()
export class ExternalMatchSyncService {
  private readonly logger = new Logger(ExternalMatchSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  async syncExternalMatch(
    bet: BetWithExternalMatch,
    tsdbEventId: string,
    eventStatus: MatchStatus,
    homeScore: number,
    awayScore: number,
  ): Promise<{ homeScoreHT: number | null; awayScoreHT: number | null }> {
    if (!bet.externalMatchId || !bet.externalMatch) {
      return { homeScoreHT: 0, awayScoreHT: 0 };
    }

    const match = bet.externalMatch;
    let homeScoreHT = homeScore; // Sempre usa o placar atual
    let awayScoreHT = awayScore;

    const updateData: Partial<ExternalMatch> = {
      status: eventStatus,
    };

    // ========================================
    // ESTRATÉGIA: Atualiza placares dinamicamente até FINISHED
    // Depois do FINISHED pela API-Sports, NÃO sobrescreve mais
    // ========================================

    // ✅ Só atualiza se ainda NÃO foi finalizado pela API-Sports
    const canUpdate =
      match.apiSource !== 'api-sports' || eventStatus !== MatchStatus.FINISHED;

    if (canUpdate && eventStatus !== MatchStatus.FINISHED) {
      // Durante o jogo: atualiza dinamicamente (marca como fonte TSDB)
      updateData.homeScoreFT = homeScore;
      updateData.awayScoreFT = awayScore;
      updateData.homeScoreHT = homeScore;
      updateData.awayScoreHT = awayScore;
      updateData.apiSource = 'tsdb'; // ✅ Marca que foi atualizado pelo TSDB

      this.logger.debug(
        `⚽ Live update (TSDB): ${eventStatus} ${homeScore}-${awayScore} (TSDB: ${tsdbEventId})`,
      );
    }

    // Quando FINALIZADO pelo TSDB, também atualiza mas mantém fonte como TSDB
    if (
      canUpdate &&
      eventStatus === MatchStatus.FINISHED &&
      match.apiSource !== 'api-sports'
    ) {
      updateData.homeScoreFT = homeScore;
      updateData.awayScoreFT = awayScore;

      // Preserva HT que já estava salvo ou usa 0-0
      if (match.homeScoreHT === null || match.awayScoreHT === null) {
        updateData.homeScoreHT = 0;
        updateData.awayScoreHT = 0;
        homeScoreHT = 0;
        awayScoreHT = 0;

        this.logger.warn(
          `⚠️ Missing HT score for finished match (TSDB: ${tsdbEventId}), using 0-0`,
        );
      } else {
        homeScoreHT = match.homeScoreHT;
        awayScoreHT = match.awayScoreHT;
      }

      updateData.apiSource = 'tsdb'; // Marca como finalizado pelo TSDB

      this.logger.log(
        `🏁 Match finished by TSDB: FT ${homeScore}-${awayScore} | HT ${homeScoreHT}-${awayScoreHT}`,
      );
    }

    // ⚠️ Se já foi finalizado pela API-Sports, não sobrescreve
    if (
      match.apiSource === 'api-sports' &&
      match.status === MatchStatus.FINISHED
    ) {
      this.logger.debug(
        `🔒 Match already finalized by API-Sports, skipping TSDB update (TSDB: ${tsdbEventId})`,
      );
      return { homeScoreHT: match.homeScoreHT, awayScoreHT: match.awayScoreHT };
    }

    // Atualiza no banco
    await this.prisma.externalMatch.update({
      where: { id: bet.externalMatchId },
      data: updateData,
    });

    return { homeScoreHT, awayScoreHT };
  }

  /**
   * Trata eventos cancelados ou adiados
   */
  private async handleCancelledOrPostponed(
    bet: BetWithExternalMatch,
    eventStatus: MatchStatus,
    tsdbEventId: string,
  ): Promise<void> {
    await this.eventsService.updateBet({
      id: bet.id,
      userId: bet.userId,
      result: Result.returned,
      actualReturn: bet.stake,
      settledAt: new Date(),
    });

    // Atualiza o status no banco se existir externalMatchId
    if (bet.externalMatchId) {
      await this.prisma.externalMatch.update({
        where: { id: bet.externalMatchId },
        data: {
          status:
            eventStatus === MatchStatus.POSTPONED
              ? MatchStatus.POSTPONED
              : MatchStatus.CANCELLED,
        },
      });

      this.logger.debug(
        `✅ Updated externalMatch ${bet.externalMatchId} (TSDB: ${tsdbEventId}) → ${eventStatus}`,
      );
    }
  }
}
