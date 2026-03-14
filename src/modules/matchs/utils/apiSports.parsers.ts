import { StatPeriod } from '@prisma/client';
import { mapStrToStatPeriod } from '../helpers/mapStrToStatPeriod.helper';
import { mapApiSportsEventType } from '../helpers/mapStrToEventType.helper';
import { z } from 'zod';
import { Decimal } from '../../../libs/database/prisma';
import {
  ApiSportsEventSchema,
  ApiSportsLineupSchema,
  ApiSportsTeamStatisticsSchema,
  ApiSportsTeamPlayersSchema,
  ApiSportsFixtureResponseItemSchema,
} from '../dto/matchDetails.dto';
import { buildEventHash } from './buildEventHash';

// Helper functions remain the same
function toInt(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === 'string') {
    const s = v.replace('%', '').trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }
  return null;
}

function toDecimal(v: unknown): Decimal | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return new Decimal(v);
  if (typeof v === 'string') {
    const s = v.trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? new Decimal(n) : null;
  }
  return null;
}

// Types derivados dos schemas
type ApiSportsLineup = z.infer<typeof ApiSportsLineupSchema>;
type ApiSportsTeamStatistics = z.infer<typeof ApiSportsTeamStatisticsSchema>;

export function parseDetails(externalMatchId: number, data: unknown) {
  // Valida o input com o schema
  const r = ApiSportsFixtureResponseItemSchema.parse(data);
  const f = r.fixture;

  return {
    externalMatchId,
    referee: f.referee ?? null,
    venueId: f.venue?.id ?? null,
    venueName: f.venue?.name ?? null,
    venueCity: f.venue?.city ?? null,
    homeTeamId: r.teams.home.id,
    awayTeamId: r.teams.away.id,
    homeWinner: r.teams.home.winner ?? null,
    awayWinner: r.teams.away.winner ?? null,
    fixtureTimestamp: BigInt(f.timestamp),
    periodsFirst: f.periods?.first ? BigInt(f.periods.first) : null,
    periodsSecond: f.periods?.second ? BigInt(f.periods.second) : null,
    statusLong: f.status?.long ?? null,
    statusShort: f.status?.short ?? null,
    statusElapsed: f.status?.elapsed ?? null,
    statusExtra: f.status?.extra ?? null,

    // espelhos JSON (opcionais)
    events: r.events ?? null,
    lineups: r.lineups ?? null,
    players: r.players ?? null,
    statisticsTotal: r.statistics ?? null,
    rawApiResponse: r,
  };
}

export function parseEvents(externalMatchId: number, events: unknown) {
  if (!Array.isArray(events)) return [];

  const validatedEvents = z.array(ApiSportsEventSchema).safeParse(events);
  if (!validatedEvents.success) return [];

  return validatedEvents.data
    .map((e) => {
      const minute = toInt(e.time.elapsed);
      if (minute === null) return null;

      return {
        externalMatchId,
        teamId: e.team.id, // ✅ Int
        teamName: e.team.name,
        minute,
        extraMinute: toInt(e.time.extra),
        eventType: mapApiSportsEventType(e.type, e.detail), // precisa bater com enum
        detail: e.detail ?? null,
        playerId: e.player?.id ?? null, // ✅ Int?
        playerName: e.player?.name ?? null,
        assistId: e.assist?.id ?? null, // ✅ Int?
        assistName: e.assist?.name ?? null,
        comments: e.comments ?? null,
        eventHash: buildEventHash(externalMatchId, e), // ✅ obrigatório no Prisma
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

export function parseLineups(externalMatchId: number, lineups: unknown) {
  if (!Array.isArray(lineups)) return [];

  const validatedLineups = z.array(ApiSportsLineupSchema).safeParse(lineups);
  if (!validatedLineups.success) {
    console.error('Error validating lineups:', validatedLineups.error);
    return [];
  }

  return validatedLineups.data
    .map((l: ApiSportsLineup) => {
      const teamId = l.team?.id;
      const teamName = l.team?.name;
      if (!teamId || !teamName) return null;

      const startXI = Array.isArray(l.startXI) ? l.startXI : [];
      const subs = Array.isArray(l.substitutes) ? l.substitutes : [];

      return {
        externalMatchId,
        teamId: l.team.id,
        teamName: l.team.name,
        formation: l.formation ? String(l.formation) : null,
        coachId: l.coach?.id ? String(l.coach.id) : null,
        coachName: l.coach?.name ? String(l.coach.name) : null,
        coachPhoto: l.coach?.photo ? String(l.coach.photo) : null,
        startingXI: startXI,
        substitutes: subs,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export function parseStatistics(
  externalMatchId: number,
  stats: unknown,
  periodStr: string,
) {
  if (!Array.isArray(stats)) return [];

  const validatedStats = z
    .array(ApiSportsTeamStatisticsSchema)
    .safeParse(stats);
  if (!validatedStats.success) {
    console.error('Error validating statistics:', validatedStats.error);
    return [];
  }

  const period: StatPeriod = mapStrToStatPeriod(periodStr);

  const get = (
    items: Array<{ type: string; value: string | number | null }>,
    type: string,
  ) => items.find((x) => x.type === type)?.value ?? null;

  return validatedStats.data
    .map((s: ApiSportsTeamStatistics) => {
      const teamId = s.team?.id;
      const teamName = s.team?.name;
      if (!teamId || !teamName) return null;

      const items = Array.isArray(s.statistics) ? s.statistics : [];

      return {
        externalMatchId,
        teamId: s.team.id,
        teamName: s.team.name,
        period,

        shotsOnGoal: toInt(get(items, 'Shots on Goal')),
        shotsOffGoal: toInt(get(items, 'Shots off Goal')),
        shotsTotal: toInt(get(items, 'Total Shots')),
        shotsBlocked: toInt(get(items, 'Blocked Shots')),
        shotsInsideBox: toInt(get(items, 'Shots insidebox')),
        shotsOutsideBox: toInt(get(items, 'Shots outsidebox')),

        fouls: toInt(get(items, 'Fouls')),
        corners: toInt(get(items, 'Corner Kicks')),
        offsides: toInt(get(items, 'Offsides')),
        possession: toInt(get(items, 'Ball Possession')),

        yellowCards: toInt(get(items, 'Yellow Cards')),
        redCards: toInt(get(items, 'Red Cards')),
        goalkeeperSaves: toInt(get(items, 'Goalkeeper Saves')),

        passesTotal: toInt(get(items, 'Total passes')),
        passesAccurate: toInt(get(items, 'Passes accurate')),
        passesPercentage: toInt(get(items, 'Passes %')),

        expectedGoals: toDecimal(get(items, 'expected_goals')),
        goalsPrevented: toDecimal(get(items, 'goals_prevented')),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export function parsePlayerStats(externalMatchId: number, payload: unknown) {
  if (!Array.isArray(payload)) return [];

  const validatedPayload = z
    .array(ApiSportsTeamPlayersSchema)
    .safeParse(payload);
  if (!validatedPayload.success) {
    console.error('Error validating player stats:', validatedPayload.error);
    return [];
  }

  const rows: Array<{
    externalMatchId: number;
    playerId: number;
    playerName: string;
    playerPhoto: string | null;
    teamId: number;
    position: string | null;
    number: number | null;
    minutesPlayed: number | null;
    rating: Decimal | null;
    isCaptain: boolean;
    isSubstitute: boolean;
    goals: number | null;
    assists: number | null;
    shotsTotal: number | null;
    shotsOnGoal: number | null;
    passesTotal: number | null;
    passesAccurate: number | null;
    passesKey: number | null;
    tackles: number | null;
    blocks: number | null;
    interceptions: number | null;
    duelsTotal: number | null;
    duelsWon: number | null;
    dribblesAttempts: number | null;
    dribblesSuccess: number | null;
    dribblesPast: number | null;
    foulsDrawn: number | null;
    foulsCommitted: number | null;
    yellowCards: number | null;
    redCards: number | null;
    saves: number | null;
    goalsConceded: number | null;
  }> = [];

  for (const teamBlock of validatedPayload.data) {
    const teamId = teamBlock.team?.id;
    const players = Array.isArray(teamBlock.players) ? teamBlock.players : [];
    if (!teamId) continue;

    for (const p of players) {
      const playerId = p.player?.id;
      const playerName = p.player?.name;
      if (!playerId || !playerName) continue;

      const st = Array.isArray(p.statistics) ? p.statistics[0] : null;
      if (!st) continue;

      rows.push({
        externalMatchId,
        playerId: playerId,
        playerName: String(playerName),
        playerPhoto: p.player?.photo ? String(p.player.photo) : null,
        teamId: teamId,

        position: st.games?.position ? String(st.games.position) : null,
        number: toInt(st.games?.number),
        minutesPlayed: toInt(st.games?.minutes),
        rating: toDecimal(st.games?.rating),
        isCaptain: Boolean(st.games?.captain ?? false),
        isSubstitute: Boolean(st.games?.substitute ?? false),

        goals: toInt(st.goals?.total),
        assists: toInt(st.goals?.assists),

        shotsTotal: toInt(st.shots?.total),
        shotsOnGoal: toInt(st.shots?.on),

        passesTotal: toInt(st.passes?.total),
        passesAccurate: toInt(st.passes?.accuracy),
        passesKey: toInt(st.passes?.key),

        tackles: toInt(st.tackles?.total),
        blocks: toInt(st.tackles?.blocks),
        interceptions: toInt(st.tackles?.interceptions),

        duelsTotal: toInt(st.duels?.total),
        duelsWon: toInt(st.duels?.won),

        dribblesAttempts: toInt(st.dribbles?.attempts),
        dribblesSuccess: toInt(st.dribbles?.success),
        dribblesPast: toInt(st.dribbles?.past),

        foulsDrawn: toInt(st.fouls?.drawn),
        foulsCommitted: toInt(st.fouls?.committed),

        yellowCards: toInt(st.cards?.yellow),
        redCards: toInt(st.cards?.red),

        saves: toInt(st.goals?.saves),
        goalsConceded: toInt(st.goals?.conceded),
      });
    }
  }

  return rows;
}
