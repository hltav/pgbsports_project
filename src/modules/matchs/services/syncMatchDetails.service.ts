// import { Injectable, Logger } from '@nestjs/common';
// import { Prisma } from '@prisma/client';
// import { PrismaService } from '../../../libs/database';
// import { ApiSportsFixtureResponseItem } from '../dto/matchDetails.dto';

// import {
//   parseDetails,
//   parseEvents,
//   parseLineups,
//   parseStatistics,
//   parsePlayerStats,
// } from '../utils/apiSports.parsers';

// type Tx = Prisma.TransactionClient;

// @Injectable()
// export class SyncMatchDetailsService {
//   private readonly logger = new Logger(SyncMatchDetailsService.name);

//   constructor(private readonly prisma: PrismaService) {}

//   /**
//    * Sincroniza TODOS os detalhes (details + eventos + lineups + stats + playerStats)
//    * usando uma única transação.
//    */
//   async syncMatchDetails(
//     externalMatchId: number,
//     apiResponse: ApiSportsFixtureResponseItem,
//   ): Promise<void> {
//     this.logger.log(`Starting match details sync | matchId=${externalMatchId}`);

//     const details = parseDetails(externalMatchId, apiResponse);
//     const events = parseEvents(externalMatchId, apiResponse.events);
//     const lineups = parseLineups(externalMatchId, apiResponse.lineups);
//     const statsAll = parseStatistics(
//       externalMatchId,
//       apiResponse.statistics,
//       'all',
//     );
//     const playerStats = parsePlayerStats(externalMatchId, apiResponse.players);

//     await this.prisma.$transaction(async (tx: Tx) => {
//       await this.upsertExternalMatchDetails(tx, details);

//       await this.replaceMatchEvents(tx, externalMatchId, events);

//       await this.replaceMatchLineups(tx, externalMatchId, lineups);

//       await this.replaceMatchStatistics(tx, externalMatchId, statsAll);

//       await this.replacePlayerMatchStats(tx, externalMatchId, playerStats);
//     });

//     this.logger.log(`✓ Match synced successfully | matchId=${externalMatchId}`);
//   }

//   /**
//    * Sincroniza SOMENTE os campos "leves" do ExternalMatchDetails (placar/status/winner).
//    * Útil quando você quer atualizar rápido sem refazer todo o restante.
//    */
//   async syncScoresOnly(
//     externalMatchId: number,
//     apiResponse: ApiSportsFixtureResponseItem,
//   ): Promise<void> {
//     this.logger.log(`Syncing scores only | matchId=${externalMatchId}`);

//     const details = parseDetails(externalMatchId, apiResponse);

//     await this.prisma.externalMatchDetails.upsert({
//       where: { externalMatchId },
//       create: details,
//       update: {
//         homeWinner: details.homeWinner,
//         awayWinner: details.awayWinner,
//         statusLong: details.statusLong,
//         statusShort: details.statusShort,
//         statusElapsed: details.statusElapsed,
//         statusExtra: details.statusExtra,
//         lastApiSyncAt: new Date(),
//       },
//     });

//     this.logger.log(`✓ Scores updated | matchId=${externalMatchId}`);
//   }

//   // ---------------------------
//   // PRIVATE HELPERS (TYPED)
//   // ---------------------------

//   private async upsertExternalMatchDetails(
//     tx: Tx,
//     details: Prisma.ExternalMatchDetailsUncheckedCreateInput,
//   ): Promise<void> {
//     // ⚠️ Não dá pra mandar externalMatchId no update porque ele é unique/relational.
//     const { externalMatchId, ...updateRest } = details;

//     if (externalMatchId === undefined)
//       throw new Error('externalMatchId is required');

//     await tx.externalMatchDetails.upsert({
//       where: { externalMatchId },
//       create: details,
//       update: {
//         ...updateRest,
//         lastApiSyncAt: new Date(),
//       },
//     });

//     this.logger.debug(
//       `ExternalMatchDetails upserted | matchId=${externalMatchId}`,
//     );
//   }

//   private async replaceMatchEvents(
//     tx: Tx,
//     externalMatchId: number,
//     events: Prisma.MatchEventCreateManyInput[],
//   ): Promise<void> {
//     await tx.matchEvent.deleteMany({ where: { externalMatchId } });

//     if (events.length > 0) {
//       await tx.matchEvent.createMany({
//         data: events,
//         // ⚠️ seu schema tem @@unique([externalMatchId, eventHash])
//         // então o dedupe funciona aqui se eventHash estiver presente.
//         skipDuplicates: true,
//       });
//     }

//     this.logger.debug(
//       `Events synced | matchId=${externalMatchId} | count=${events.length}`,
//     );
//   }

//   private async replaceMatchLineups(
//     tx: Tx,
//     externalMatchId: number,
//     lineups: Prisma.MatchLineupCreateManyInput[],
//   ): Promise<void> {
//     await tx.matchLineup.deleteMany({ where: { externalMatchId } });

//     if (lineups.length > 0) {
//       await tx.matchLineup.createMany({
//         data: lineups,
//         // @@unique([externalMatchId, teamId]) no Prisma
//         skipDuplicates: true,
//       });
//     }

//     this.logger.debug(
//       `Lineups synced | matchId=${externalMatchId} | count=${lineups.length}`,
//     );
//   }

//   private async replaceMatchStatistics(
//     tx: Tx,
//     externalMatchId: number,
//     stats: Prisma.MatchStatisticCreateManyInput[],
//   ): Promise<void> {
//     await tx.matchStatistic.deleteMany({ where: { externalMatchId } });

//     if (stats.length > 0) {
//       await tx.matchStatistic.createMany({
//         data: stats,
//         // @@unique([externalMatchId, teamId, period])
//         skipDuplicates: true,
//       });
//     }

//     this.logger.debug(
//       `Match statistics synced | matchId=${externalMatchId} | count=${stats.length}`,
//     );
//   }

//   private async replacePlayerMatchStats(
//     tx: Tx,
//     externalMatchId: number,
//     playerStats: Prisma.PlayerMatchStatCreateManyInput[],
//   ): Promise<void> {
//     await tx.playerMatchStat.deleteMany({ where: { externalMatchId } });

//     if (playerStats.length > 0) {
//       await tx.playerMatchStat.createMany({
//         data: playerStats,
//         // @@unique([externalMatchId, playerId])
//         skipDuplicates: true,
//       });
//     }

//     this.logger.debug(
//       `Player stats synced | matchId=${externalMatchId} | count=${playerStats.length}`,
//     );
//   }
// }

import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../libs/database';
import { ApiSportsFixtureResponseItem } from '../dto/matchDetails.dto';

import {
  parseDetails,
  parseEvents,
  parseLineups,
  parseStatistics,
  parsePlayerStats,
} from '../utils/apiSports.parsers';

@Injectable()
export class SyncMatchDetailsService {
  private readonly logger = new Logger(SyncMatchDetailsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async syncMatchDetails(
    externalMatchId: number,
    apiResponse: ApiSportsFixtureResponseItem,
  ): Promise<void> {
    this.logger.log(`Starting match details sync | matchId=${externalMatchId}`);

    const details = parseDetails(externalMatchId, apiResponse);
    const events = parseEvents(externalMatchId, apiResponse.events);
    const lineups = parseLineups(externalMatchId, apiResponse.lineups);
    const statsAll = parseStatistics(
      externalMatchId,
      apiResponse.statistics,
      'all',
    );
    const playerStats = parsePlayerStats(externalMatchId, apiResponse.players);

    await this.withAdvisoryLock(externalMatchId, async () => {
      await this.upsertExternalMatchDetails(details);

      await Promise.all([
        this.replaceMatchEvents(externalMatchId, events),
        this.replaceMatchLineups(externalMatchId, lineups),
        this.replaceMatchStatistics(externalMatchId, statsAll),
        this.replacePlayerMatchStats(externalMatchId, playerStats),
      ]);
    });

    this.logger.log(`✓ Match synced successfully | matchId=${externalMatchId}`);
  }

  // ------------------------------------------------------------------
  // 🔒 Advisory Lock (PostgreSQL)
  // ------------------------------------------------------------------

  private async withAdvisoryLock(
    key: number,
    callback: () => Promise<void>,
  ): Promise<void> {
    await this.prisma.$executeRawUnsafe(`SELECT pg_advisory_lock(${key})`);

    try {
      await callback();
    } finally {
      await this.prisma.$executeRawUnsafe(`SELECT pg_advisory_unlock(${key})`);
    }
  }

  // ------------------------------------------------------------------
  // 🔹 ExternalMatchDetails (leve)
  // ------------------------------------------------------------------

  private async upsertExternalMatchDetails(
    details: Prisma.ExternalMatchDetailsUncheckedCreateInput,
  ): Promise<void> {
    const { externalMatchId, ...updateRest } = details;

    if (externalMatchId === undefined) {
      throw new Error('externalMatchId is required');
    }

    await this.prisma.externalMatchDetails.upsert({
      where: { externalMatchId },
      create: details,
      update: {
        ...updateRest,
        lastApiSyncAt: new Date(),
      },
    });

    this.logger.debug(
      `ExternalMatchDetails upserted | matchId=${externalMatchId}`,
    );
  }

  // ------------------------------------------------------------------
  // 🔹 Eventos
  // ------------------------------------------------------------------

  private async replaceMatchEvents(
    externalMatchId: number,
    events: Prisma.MatchEventCreateManyInput[],
  ): Promise<void> {
    await this.prisma.matchEvent.deleteMany({
      where: { externalMatchId },
    });

    if (events.length > 0) {
      await this.prisma.matchEvent.createMany({
        data: events,
        skipDuplicates: true,
      });
    }

    this.logger.debug(
      `Events synced | matchId=${externalMatchId} | count=${events.length}`,
    );
  }

  // ------------------------------------------------------------------
  // 🔹 Lineups
  // ------------------------------------------------------------------

  private async replaceMatchLineups(
    externalMatchId: number,
    lineups: Prisma.MatchLineupCreateManyInput[],
  ): Promise<void> {
    await this.prisma.matchLineup.deleteMany({
      where: { externalMatchId },
    });

    if (lineups.length > 0) {
      await this.prisma.matchLineup.createMany({
        data: lineups,
        skipDuplicates: true,
      });
    }

    this.logger.debug(
      `Lineups synced | matchId=${externalMatchId} | count=${lineups.length}`,
    );
  }

  // ------------------------------------------------------------------
  // 🔹 Estatísticas
  // ------------------------------------------------------------------

  private async replaceMatchStatistics(
    externalMatchId: number,
    stats: Prisma.MatchStatisticCreateManyInput[],
  ): Promise<void> {
    await this.prisma.matchStatistic.deleteMany({
      where: { externalMatchId },
    });

    if (stats.length > 0) {
      await this.prisma.matchStatistic.createMany({
        data: stats,
        skipDuplicates: true,
      });
    }

    this.logger.debug(
      `Match statistics synced | matchId=${externalMatchId} | count=${stats.length}`,
    );
  }

  // ------------------------------------------------------------------
  // 🔹 Player Stats
  // ------------------------------------------------------------------

  private async replacePlayerMatchStats(
    externalMatchId: number,
    playerStats: Prisma.PlayerMatchStatCreateManyInput[],
  ): Promise<void> {
    await this.prisma.playerMatchStat.deleteMany({
      where: { externalMatchId },
    });

    if (playerStats.length > 0) {
      await this.prisma.playerMatchStat.createMany({
        data: playerStats,
        skipDuplicates: true,
      });
    }

    this.logger.debug(
      `Player stats synced | matchId=${externalMatchId} | count=${playerStats.length}`,
    );
  }
}
