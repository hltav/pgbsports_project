import { Injectable, Logger } from '@nestjs/common';
import { LookupEvent } from './../../../shared/thesportsdb-api/schemas/allEvents/allEvents.schema';
import { LiveScoreEvent } from './../../../shared/thesportsdb-api/schemas/live/liveScore.schema';
import { TheSportsDbEventsService } from './../../../shared/thesportsdb-api/services/events-thesportsdb.service';
import { mapStrStatusToMatchStatus } from './../../../shared/thesportsdb-api/helpers/mapStatusToEvent.helper';
import { MatchStatus } from '@prisma/client';

interface ResolvedEventData {
  event: LiveScoreEvent | LookupEvent;
  canonicalStatus: MatchStatus;
  source: 'live' | 'lookup';
}

@Injectable()
export class EventDataResolverService {
  private readonly logger = new Logger(EventDataResolverService.name);

  constructor(
    private readonly theSportsDbEventsService: TheSportsDbEventsService,
  ) {}

  /**
   * Busca dados do evento em Live Scores ou Event Lookup e retorna o status canônico.
   */
  async resolveEventData(
    sportModality: string,
    tsdbEventId: string | null,
  ): Promise<ResolvedEventData | null> {
    if (!tsdbEventId) {
      this.logger.debug('No tsdbEventId provided, skipping event lookup');
      return null;
    }

    try {
      const event =
        await this.theSportsDbEventsService.getEventById(tsdbEventId);

      if (event) {
        const canonicalStatus = mapStrStatusToMatchStatus(
          event.strStatus || 'FT',
        );

        // 🔥 Log contextual baseado no status real
        const score = `${event.intHomeScore ?? 'null'} - ${event.intAwayScore ?? 'null'}`;
        const homeTeam = event.strHomeTeam;
        const awayTeam = event.strAwayTeam;

        if (
          canonicalStatus === MatchStatus.LIVE ||
          canonicalStatus === MatchStatus.FIRST_HALF ||
          canonicalStatus === MatchStatus.SECOND_HALF ||
          canonicalStatus === MatchStatus.HALF_TIME
        ) {
          this.logger.warn(
            `⚠️ Event ${tsdbEventId} is LIVE (${canonicalStatus}, ${homeTeam} ${score} ${awayTeam})`,
          );
        } else if (canonicalStatus === MatchStatus.NOT_STARTED) {
          this.logger.debug(
            `📅 Event ${tsdbEventId} not started yet (${canonicalStatus})`,
          );
        } else if (canonicalStatus === MatchStatus.FINISHED) {
          this.logger.debug(
            `🏁 Event ${tsdbEventId} finished (${canonicalStatus}, ${score})`,
          );
        } else {
          this.logger.debug(
            `📋 Event ${tsdbEventId} status: ${canonicalStatus} (${score})`,
          );
        }

        return { event, canonicalStatus, source: 'lookup' };
      }

      this.logger.warn(`❌ Event ${tsdbEventId} not found in any source`);
      return null;
    } catch (error) {
      this.logger.error(`💥 Error resolving event ${tsdbEventId}:`, error);
      return null;
    }
  }
}
