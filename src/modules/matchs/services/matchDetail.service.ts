// import { Injectable, Logger } from '@nestjs/common';
// import { PrismaService } from './../../../libs/database';
// import {
//   ApiSportsFixtureResponse,
//   MatchEventDTO,
//   MatchLineupDTO,
//   MatchStatisticDTO,
//   PlayerMatchStatDTO,
// } from '../dto/matchDetails.dto';
// import { EventType, StatPeriod } from '@prisma/client';
// import { mapStrToEventType } from '../helpers/mapStrToEventType.helper';
// import { mapStrToStatPeriod } from '../helpers/mapStrToStatPeriod.helper';

// @Injectable()
// export class MatchDetailsService {
//   private readonly logger = new Logger(MatchDetailsService.name);

//   constructor(private readonly prisma: PrismaService) {}

//   async saveFullDetails(
//     externalMatchId: number,
//     payload: ApiSportsFixtureResponse,
//   ): Promise<void> {
//     this.logger.log(`Saving full details for match=${externalMatchId}`);

//     // 1️⃣ ExternalMatchDetails
//     await this.prisma.externalMatchDetails.upsert({
//       where: { externalMatchId },
//       update: {
//         referee: payload.fixture.referee,
//         venueName: payload.fixture.venue?.name,
//         venueCity: payload.fixture.venue?.city,
//         statusLong: payload.fixture.status.long,
//         statusShort: payload.fixture.status.short,
//         statusElapsed: payload.fixture.status.elapsed,
//         statusExtra: payload.fixture.status.extra,
//         events: payload.events,
//         lineups: payload.lineups,
//         players: payload.players,
//         statisticsTotal: payload.statistics,
//         rawApiResponse: payload,
//         lastApiSyncAt: new Date(),
//       },
//       create: {
//         externalMatchId,
//         homeTeamId: payload.teams.home.id,
//         awayTeamId: payload.teams.away.id,
//         fixtureTimestamp: payload.fixture.timestamp,
//         referee: payload.fixture.referee,
//         venueId: payload.fixture.venue?.id,
//         venueName: payload.fixture.venue?.name,
//         venueCity: payload.fixture.venue?.city,
//         homeWinner: payload.teams.home.winner,
//         awayWinner: payload.teams.away.winner,
//         periodsFirst: payload.fixture.periods?.first,
//         periodsSecond: payload.fixture.periods?.second,
//         statusLong: payload.fixture.status.long,
//         statusShort: payload.fixture.status.short,
//         statusElapsed: payload.fixture.status.elapsed,
//         statusExtra: payload.fixture.status.extra,
//         events: payload.events,
//         lineups: payload.lineups,
//         players: payload.players,
//         statisticsTotal: payload.statistics,
//         rawApiResponse: payload,
//         lastApiSyncAt: new Date(),
//       },
//     });

//     // 2️⃣ MatchEvent
//     if (
//       payload.events &&
//       Array.isArray(payload.events) &&
//       payload.events.length > 0
//     ) {
//       const events: MatchEventDTO[] = payload.events.map((e) => ({
//         externalMatchId,
//         teamId: String(e?.team?.id ?? ''),
//         teamName: String(e?.team?.name ?? ''),
//         minute: Number(e?.time?.elapsed ?? 0),
//         extraMinute: e?.time?.extra ? Number(e.time.extra) : null,
//         eventType: mapStrToEventType(String(e?.type ?? '')) as EventType, // ✅ Enum
//         detail: e?.detail ? String(e.detail) : null,
//         playerId: e?.player?.id ? String(e.player.id) : null,
//         playerName: e?.player?.name ? String(e.player.name) : null,
//         assistId: e?.assist?.id ? String(e.assist.id) : null,
//         assistName: e?.assist?.name ? String(e.assist.name) : null,
//         comments: e?.comments ? String(e.comments) : null,
//         createdAt: new Date(),
//       }));

//       await this.prisma.matchEvent.createMany({
//         data: events,
//         skipDuplicates: true,
//       });
//     }

//     // 3️⃣ MatchLineup
//     if (
//       payload.lineups &&
//       Array.isArray(payload.lineups) &&
//       payload.lineups.length > 0
//     ) {
//       const lineups: MatchLineupDTO[] = payload.lineups.map((l: any) => ({
//         externalMatchId,
//         teamId: String(l?.team?.id ?? ''),
//         teamName: String(l?.team?.name ?? ''),
//         formation: l?.formation ? String(l.formation) : null,
//         coachId: l?.coach?.id ? String(l.coach.id) : null,
//         coachName: l?.coach?.name ? String(l.coach.name) : null,
//         coachPhoto: l?.coach?.photo ? String(l.coach.photo) : null,
//         startingXI: l?.startXI ?? [],
//         substitutes: l?.substitutes ?? [],
//         createdAt: new Date(),
//       }));

//       await this.prisma.matchLineup.createMany({
//         data: lineups,
//         skipDuplicates: true,
//       });
//     }

//     // 4️⃣ MatchStatistic
//     if (
//       payload.statistics &&
//       Array.isArray(payload.statistics) &&
//       payload.statistics.length > 0
//     ) {
//       const statistics: MatchStatisticDTO[] = payload.statistics.map(
//         (s: any) => {
//           const stats = s?.statistics ?? [];

//           const findStatValue = (type: string): number | null => {
//             const stat = stats.find((x: any) => x?.type === type);
//             return stat?.value ? Number(stat.value) : null;
//           };

//           const findStatValueString = (type: string): string => {
//             const stat = stats.find((x: any) => x?.type === type);
//             return stat?.value ? String(stat.value) : '0';
//           };

//           // ✅ Detectar período (se a API enviar, senão assume FULL_TIME)
//           const periodStr = s?.period ?? 'Regular Time';
//           const period = mapStrToStatPeriod(periodStr) as StatPeriod;

//           return {
//             externalMatchId,
//             teamId: String(s?.team?.id ?? ''),
//             teamName: String(s?.team?.name ?? ''),
//             period: mapStrToStatPeriod(periodStr) as StatPeriod,
//             shotsOnGoal: findStatValue('Shots on Goal'),
//             shotsOffGoal: findStatValue('Shots off Goal'),
//             possession: parseInt(
//               findStatValueString('Ball Possession').replace('%', ''),
//               10,
//             ),
//             passesTotal: findStatValue('Total passes'),
//             passesAccurate: findStatValue('Passes accurate'),
//             passesPercentage: parseInt(
//               findStatValueString('Passes %').replace('%', ''),
//               10,
//             ),
//             expectedGoals: parseFloat(findStatValueString('expected_goals')),
//             goalsPrevented: parseFloat(findStatValueString('goals_prevented')),
//             createdAt: new Date(),
//           };
//         },
//       );

//       await this.prisma.matchStatistic.createMany({
//         data: statistics,
//         skipDuplicates: true,
//       });
//     }

//     // 5️⃣ PlayerMatchStat
//     if (
//       payload.players &&
//       Array.isArray(payload.players) &&
//       payload.players.length > 0
//     ) {
//       const playerStats: PlayerMatchStatDTO[] = payload.players.flatMap(
//         (team: any) =>
//           (team?.players ?? []).map((p: any) => {
//             const stat = p?.statistics?.[0] ?? {};
//             const games = stat?.games ?? {};
//             const goals = stat?.goals ?? {};
//             const shots = stat?.shots ?? {};
//             const passes = stat?.passes ?? {};
//             const cards = stat?.cards ?? {};

//             return {
//               externalMatchId,
//               playerId: String(p?.player?.id ?? ''),
//               playerName: String(p?.player?.name ?? ''),
//               playerPhoto: p?.player?.photo ? String(p.player.photo) : null,
//               teamId: String(team?.team?.id ?? ''),
//               position: games?.position ? String(games.position) : null,
//               number: games?.number ? Number(games.number) : null,
//               minutesPlayed: games?.minutes ? Number(games.minutes) : null,
//               rating: games?.rating ? parseFloat(String(games.rating)) : null,
//               goals: goals?.total ? Number(goals.total) : null,
//               assists: goals?.assists ? Number(goals.assists) : null,
//               shotsTotal: shots?.total ? Number(shots.total) : null,
//               passesTotal: passes?.total ? Number(passes.total) : null,
//               passesAccurate: passes?.accuracy
//                 ? parseInt(String(passes.accuracy), 10)
//                 : null,
//               yellowCards: cards?.yellow ? Number(cards.yellow) : null,
//               redCards: cards?.red ? Number(cards.red) : null,
//               createdAt: new Date(),
//             };
//           }),
//       );

//       await this.prisma.playerMatchStat.createMany({
//         data: playerStats,
//         skipDuplicates: true,
//       });
//     }

//     this.logger.log(`✓ Full details saved for match=${externalMatchId}`);
//   }
// }

// import { Injectable, Logger } from '@nestjs/common';
// import { PrismaService } from '../../../libs/database'; // ajuste
// import crypto from 'node:crypto';

// import {
//   parseDetails,
//   parseEvents,
//   parseLineups,
//   parsePlayerStats,
//   parseStatistics,
// } from './apiSports.parsers';

// import { ApiSportsFixtureResponseSchema } from './schemas'; // seu schema zod

// @Injectable()
// export class ExternalMatchSyncService {
//   private readonly logger = new Logger(ExternalMatchSyncService.name);

//   constructor(
//     private readonly prisma: PrismaService,
//     // private readonly apiSports: ApiSportsClient,
//   ) {}

//   async syncFixtureIntoMatch(externalMatchId: number, rawApiPayload: unknown) {
//     // payload que você mandou tem { response: [ { ... } ] }
//     const root: any = rawApiPayload as any;
//     const one = root?.response?.[0];
//     if (!one) throw new Error('API-Sports: response[0] not found');

//     // valida só o “miolo” (o item dentro do response)
//     const parsed = ApiSportsFixtureResponseSchema.parse(one);

//     const dataHash = this.hash(parsed);

//     return this.prisma.$transaction(async (tx) => {
//       // 1) Details (1-1)
//       const detailsData = parseDetails(externalMatchId, parsed);

//       const details = await tx.externalMatchDetails.upsert({
//         where: { externalMatchId },
//         create: { ...detailsData, dataHash },
//         update: { ...detailsData, dataHash, lastApiSyncAt: new Date() },
//       });

//       // 2) Lineups (upsert unique [externalMatchId, teamId])
//       const lineups = parseLineups(externalMatchId, parsed.lineups);
//       for (const l of lineups) {
//         await tx.matchLineup.upsert({
//           where: {
//             externalMatchId_teamId: { externalMatchId, teamId: l.teamId },
//           },
//           create: l,
//           update: {
//             teamName: l.teamName,
//             formation: l.formation,
//             coachId: l.coachId,
//             coachName: l.coachName,
//             coachPhoto: l.coachPhoto,
//             startingXI: l.startingXI,
//             substitutes: l.substitutes,
//           },
//         });
//       }

//       // 3) Statistics FULL_TIME (do payload “fixtures” vem tudo em statistics)
//       const statsFull = parseStatistics(
//         externalMatchId,
//         parsed.statistics,
//         'FULL_TIME',
//       );
//       for (const s of statsFull) {
//         await tx.matchStatistic.upsert({
//           where: {
//             externalMatchId_teamId_period: {
//               externalMatchId,
//               teamId: s.teamId,
//               period: s.period,
//             },
//           },
//           create: s,
//           update: {
//             ...s,
//             externalMatchId: undefined as any,
//             teamId: undefined as any,
//             period: undefined as any,
//           },
//           // se preferir, liste campos (mais seguro). Eu deixei simples.
//         });
//       }

//       // 4) Events (sem unique => delete+create para idempotência)
//       const events = parseEvents(externalMatchId, parsed.events);
//       await tx.matchEvent.deleteMany({ where: { externalMatchId } });
//       if (events.length) await tx.matchEvent.createMany({ data: events });

//       // 5) Player stats (upsert unique [externalMatchId, playerId])
//       const pstats = parsePlayerStats(externalMatchId, parsed.players);
//       for (const ps of pstats) {
//         await tx.playerMatchStat.upsert({
//           where: {
//             externalMatchId_playerId: {
//               externalMatchId,
//               playerId: ps.playerId,
//             },
//           },
//           create: ps,
//           update: {
//             playerName: ps.playerName,
//             playerPhoto: ps.playerPhoto,
//             teamId: ps.teamId,
//             position: ps.position,
//             number: ps.number,
//             minutesPlayed: ps.minutesPlayed,
//             rating: ps.rating,
//             isCaptain: ps.isCaptain,
//             isSubstitute: ps.isSubstitute,
//             goals: ps.goals,
//             assists: ps.assists,
//             shotsTotal: ps.shotsTotal,
//             shotsOnGoal: ps.shotsOnGoal,
//             passesTotal: ps.passesTotal,
//             passesAccurate: ps.passesAccurate,
//             passesKey: ps.passesKey,
//             tackles: ps.tackles,
//             blocks: ps.blocks,
//             interceptions: ps.interceptions,
//             duelsTotal: ps.duelsTotal,
//             duelsWon: ps.duelsWon,
//             dribblesAttempts: ps.dribblesAttempts,
//             dribblesSuccess: ps.dribblesSuccess,
//             dribblesPast: ps.dribblesPast,
//             foulsDrawn: ps.foulsDrawn,
//             foulsCommitted: ps.foulsCommitted,
//             yellowCards: ps.yellowCards,
//             redCards: ps.redCards,
//             saves: ps.saves,
//             goalsConceded: ps.goalsConceded,
//           },
//         });
//       }

//       this.logger.log(
//         `Synced externalMatchId=${externalMatchId} hash=${dataHash} events=${events.length} lineups=${lineups.length} stats=${statsFull.length} players=${pstats.length}`,
//       );

//       return {
//         detailsId: details.id,
//         dataHash,
//         counts: {
//           events: events.length,
//           lineups: lineups.length,
//           stats: statsFull.length,
//           players: pstats.length,
//         },
//       };
//     });
//   }

//   private hash(obj: unknown) {
//     return crypto.createHash('sha1').update(JSON.stringify(obj)).digest('hex');
//   }
// }
