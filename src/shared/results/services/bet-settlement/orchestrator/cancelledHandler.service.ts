import { Injectable, Logger } from '@nestjs/common';
import { BetWithExternalMatch } from '../types/betWithExternal.types';
import { PrismaService } from '../../../../../libs/database';
import { MatchStatus, Result } from '@prisma/client';
import { EventsService } from 'src/modules/events/events.service';

@Injectable()
export class CancelledHandlerService {
  private readonly logger = new Logger(CancelledHandlerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  async handleCancelledOrPostponed(
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
