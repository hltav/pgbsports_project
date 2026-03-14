// import { Injectable, Logger } from '@nestjs/common';
// import { SoccerService } from './../../../shared/api-sports/api/soccer/services/soccer.service';
// import { UpdateMatchService } from './updateMatchs.service';
// import { UpdateMatchDTO } from '../dto';
// import { ApiSportsFixtureResponseItem } from '../dto/matchDetails.dto';
// import { mapStrStatusToMatchStatus } from './../../../shared/thesportsdb-api/helpers/mapStatusToEvent.helper';
// import { MatchStatus } from '@prisma/client';
// import { PrismaService } from './../../../libs/database/prisma/prisma.service';

// @Injectable()
// export class ApiSportsSyncService {
//   private readonly logger = new Logger(ApiSportsSyncService.name);

//   constructor(
//     private readonly soccerService: SoccerService,
//     private readonly updateMatchService: UpdateMatchService,
//     private readonly prisma: PrismaService,
//   ) {}

//   // CORE DECISION LOGIC
//   private shouldCallApi(match: {
//     eventDate: Date;
//     status: MatchStatus;
//     lastSyncAt: Date;
//     isPostponed: boolean;
//   }): boolean {
//     const now = Date.now();
//     const eventTime = match.eventDate.getTime();

//     const START_BUFFER = 5 * 60 * 1000; // 5 min
//     const LIVE_INTERVAL = 2 * 60 * 1000; // 2 min
//     const SCHEDULED_INTERVAL = 10 * 60 * 1000; // 10 min
//     const POSTPONED_INTERVAL = 6 * 60 * 60 * 1000; // 6h

//     // Nunca chama antes do jogo
//     if (now < eventTime + START_BUFFER) {
//       return false;
//     }

//     // Já finalizado → nunca mais
//     if (match.status === MatchStatus.FINISHED) {
//       return false;
//     }

//     const elapsed = now - match.lastSyncAt.getTime();

//     if (match.isPostponed) {
//       return elapsed > POSTPONED_INTERVAL;
//     }

//     if (match.status === MatchStatus.LIVE) {
//       return elapsed > LIVE_INTERVAL;
//     }

//     // SCHEDULED ou outros estados
//     return elapsed > SCHEDULED_INTERVAL;
//   }

//   // SYNC SINGLE FIXTURE
//   async syncFixtureById(apiSportsEventId: string): Promise<boolean> {
//     try {
//       this.logger.log(`🔍 Sync check for fixture ${apiSportsEventId}`);

//       // 1️⃣ Busca estado local primeiro
//       const match = await this.prisma.externalMatch.findUnique({
//         where: { apiSportsEventId },
//         select: {
//           eventDate: true,
//           status: true,
//           lastSyncAt: true,
//           isPostponed: true,
//         },
//       });

//       if (!match) {
//         this.logger.warn(
//           `❌ ExternalMatch ${apiSportsEventId} not found locally`,
//         );
//         return false;
//       }

//       if (!this.shouldCallApi(match)) {
//         this.logger.debug(
//           `⏭️ Skipping API call for ${apiSportsEventId} (status=${match.status})`,
//         );
//         return false;
//       }

//       // 2️⃣ Chamada externa (só agora!)
//       const fixtureResponse =
//         await this.soccerService.getFixtureById(apiSportsEventId);

//       if (!fixtureResponse.response?.length) {
//         this.logger.warn(
//           `❌ Fixture ${apiSportsEventId} not found in API-Sports`,
//         );
//         return false;
//       }

//       const fixture = fixtureResponse.response[0];

//       const canonicalStatus = mapStrStatusToMatchStatus(
//         fixture.fixture.status.short,
//       );

//       const isFinished = canonicalStatus === MatchStatus.FINISHED;

//       // 3️⃣ Atualiza scores apenas se finalizado
//       if (isFinished) {
//         const scores: Partial<UpdateMatchDTO> = {
//           homeScoreHT: fixture.score.halftime.home ?? 0,
//           awayScoreHT: fixture.score.halftime.away ?? 0,
//           homeScoreFT: fixture.score.fulltime.home ?? 0,
//           awayScoreFT: fixture.score.fulltime.away ?? 0,
//           status: fixture.fixture.status.short,
//           eventDateLocal: fixture.fixture.date
//             ? new Date(fixture.fixture.date)
//             : undefined,
//           timezone: fixture.fixture.timezone || undefined,
//           venue: fixture.fixture.venue?.name || undefined,
//           thumbnail: fixture.league.logo || undefined,
//         };

//         await this.updateMatchService.updateScores(
//           String(fixture.fixture.id),
//           scores,
//           fixture as unknown as ApiSportsFixtureResponseItem,
//         );

//         this.logger.log(
//           `✅ FINISHED: ${fixture.teams.home.name} ${scores.homeScoreFT}-${scores.awayScoreFT} ${fixture.teams.away.name}`,
//         );
//       }

//       // 4️⃣ Atualiza controle de sync
//       await this.prisma.externalMatch.update({
//         where: { apiSportsEventId },
//         data: {
//           status: canonicalStatus,
//           lastSyncAt: new Date(),
//           syncAttempts: { increment: 1 },
//           syncError: null,
//         },
//       });

//       return isFinished;
//     } catch (error) {
//       await this.prisma.externalMatch.update({
//         where: { apiSportsEventId },
//         data: {
//           lastSyncAt: new Date(),
//           syncAttempts: { increment: 1 },
//           syncError: error instanceof Error ? error.message : String(error),
//         },
//       });

//       this.logger.error(
//         `❌ Error syncing fixture ${apiSportsEventId}`,
//         JSON.stringify(error, Object.getOwnPropertyNames(error)),
//       );

//       return false;
//     }
//   }

//   // SYNC MULTIPLE FIXTURES
//   async syncMultipleFixtures(apiSportsEventIds: string[]): Promise<{
//     finished: number;
//     pending: number;
//     errors: number;
//   }> {
//     const stats = { finished: 0, pending: 0, errors: 0 };

//     this.logger.log(
//       `📊 Starting batch sync for ${apiSportsEventIds.length} fixtures`,
//     );

//     for (const eventId of apiSportsEventIds) {
//       try {
//         const isFinished = await this.syncFixtureById(eventId);

//         if (isFinished) {
//           stats.finished++;
//         } else {
//           stats.pending++;
//         }
//       } catch {
//         stats.errors++;
//       }

//       await this.sleep(100); // proteção de cota
//     }

//     this.logger.log(
//       `✅ Batch completed → ${stats.finished} finished | ${stats.pending} pending | ${stats.errors} errors`,
//     );

//     return stats;
//   }

//   private sleep(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }
// }

import { Injectable, Logger } from '@nestjs/common';
import { SoccerService } from '../../../shared/api-sports/api/soccer/services/soccer.service';
import { UpdateMatchService } from './updateMatchs.service';
import { UpdateMatchDTO } from '../dto';
import { ApiSportsFixtureResponseItem } from '../dto/matchDetails.dto';
import { mapStrStatusToMatchStatus } from '../../../shared/thesportsdb-api/helpers/mapStatusToEvent.helper';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../../../libs/database/prisma/prisma.service';
import { QueueService } from '../../../libs/services/queue/queue.service';

@Injectable()
export class ApiSportsSyncService {
  private readonly logger = new Logger(ApiSportsSyncService.name);

  constructor(
    private readonly soccerService: SoccerService,
    private readonly updateMatchService: UpdateMatchService,
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService, // ← novo
  ) {}

  // ─── CORE DECISION LOGIC ─────────────────────────────────────────────────────

  private shouldCallApi(match: {
    eventDate: Date;
    status: MatchStatus;
    lastSyncAt: Date;
    isPostponed: boolean;
  }): boolean {
    const now = Date.now();
    const eventTime = match.eventDate.getTime();

    const START_BUFFER = 5 * 60 * 1000;
    const LIVE_INTERVAL = 2 * 60 * 1000;
    const SCHEDULED_INTERVAL = 10 * 60 * 1000;
    const POSTPONED_INTERVAL = 6 * 60 * 60 * 1000;

    if (now < eventTime + START_BUFFER) return false;
    if (match.status === MatchStatus.FINISHED) return false;

    const elapsed = now - match.lastSyncAt.getTime();

    if (match.isPostponed) return elapsed > POSTPONED_INTERVAL;
    if (match.status === MatchStatus.LIVE) return elapsed > LIVE_INTERVAL;

    return elapsed > SCHEDULED_INTERVAL;
  }

  // ─── SYNC SINGLE FIXTURE (chamado pelo worker) ────────────────────────────────

  async syncFixtureById(apiSportsEventId: string): Promise<boolean> {
    try {
      this.logger.log(`🔍 Sync check for fixture ${apiSportsEventId}`);

      const match = await this.prisma.externalMatch.findUnique({
        where: { apiSportsEventId },
        select: {
          eventDate: true,
          status: true,
          lastSyncAt: true,
          isPostponed: true,
        },
      });

      if (!match) {
        this.logger.warn(
          `❌ ExternalMatch ${apiSportsEventId} not found locally`,
        );
        return false;
      }

      if (!this.shouldCallApi(match)) {
        this.logger.debug(
          `⏭️ Skipping API call for ${apiSportsEventId} (status=${match.status})`,
        );
        return false;
      }

      const fixtureResponse =
        await this.soccerService.getFixtureById(apiSportsEventId);

      if (!fixtureResponse.response?.length) {
        this.logger.warn(
          `❌ Fixture ${apiSportsEventId} not found in API-Sports`,
        );
        return false;
      }

      const fixture = fixtureResponse.response[0];
      const canonicalStatus = mapStrStatusToMatchStatus(
        fixture.fixture.status.short,
      );
      const isFinished = canonicalStatus === MatchStatus.FINISHED;

      if (isFinished) {
        const scores: Partial<UpdateMatchDTO> = {
          homeScoreHT: fixture.score.halftime.home ?? 0,
          awayScoreHT: fixture.score.halftime.away ?? 0,
          homeScoreFT: fixture.score.fulltime.home ?? 0,
          awayScoreFT: fixture.score.fulltime.away ?? 0,
          status: fixture.fixture.status.short,
          eventDateLocal: fixture.fixture.date
            ? new Date(fixture.fixture.date)
            : undefined,
          timezone: fixture.fixture.timezone || undefined,
          venue: fixture.fixture.venue?.name || undefined,
          thumbnail: fixture.league.logo || undefined,
        };

        await this.updateMatchService.updateScores(
          String(fixture.fixture.id),
          scores,
          fixture as unknown as ApiSportsFixtureResponseItem,
        );

        this.logger.log(
          `✅ FINISHED: ${fixture.teams.home.name} ${scores.homeScoreFT}-${scores.awayScoreFT} ${fixture.teams.away.name}`,
        );
      }

      await this.prisma.externalMatch.update({
        where: { apiSportsEventId },
        data: {
          status: canonicalStatus,
          lastSyncAt: new Date(),
          syncAttempts: { increment: 1 },
          syncError: null,
        },
      });

      return isFinished;
    } catch (error) {
      await this.prisma.externalMatch.update({
        where: { apiSportsEventId },
        data: {
          lastSyncAt: new Date(),
          syncAttempts: { increment: 1 },
          syncError: error instanceof Error ? error.message : String(error),
        },
      });

      this.logger.error(
        `❌ Error syncing fixture ${apiSportsEventId}`,
        JSON.stringify(error, Object.getOwnPropertyNames(error)),
      );

      return false;
    }
  }

  async syncMultipleFixtures(apiSportsEventIds: string[]): Promise<{
    finished: number;
    pending: number;
    errors: number;
  }> {
    const stats = { finished: 0, pending: 0, errors: 0 };

    this.logger.log(
      `📊 Starting batch sync for ${apiSportsEventIds.length} fixtures`,
    );

    for (const eventId of apiSportsEventIds) {
      try {
        const isFinished = await this.syncFixtureById(eventId);

        if (isFinished) {
          stats.finished++;
        } else {
          stats.pending++;
        }
      } catch {
        stats.errors++;
      }

      await this.sleep(100); // proteção de cota
    }

    this.logger.log(
      `✅ Batch completed → ${stats.finished} finished | ${stats.pending} pending | ${stats.errors} errors`,
    );

    return stats;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ─── ENFILEIRA MÚLTIPLAS PARTIDAS (substitui syncMultipleFixtures) ────────────

  async enqueueBatchSync(apiSportsEventIds: string[]): Promise<{
    queued: number;
    jobIds: string[];
  }> {
    this.logger.log(
      `📊 Enqueueing ${apiSportsEventIds.length} fixtures for async sync`,
    );

    return this.queueService.enqueueFixtureBatch(apiSportsEventIds);
  }

  // ─── ENFILEIRA UMA ÚNICA PARTIDA ─────────────────────────────────────────────

  async enqueueSync(apiSportsEventId: string): Promise<string> {
    this.logger.log(`📥 Enqueueing fixture ${apiSportsEventId}`);
    return this.queueService.enqueueFixture(apiSportsEventId);
  }
}
