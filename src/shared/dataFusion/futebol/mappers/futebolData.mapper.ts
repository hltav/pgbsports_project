import { FixtureResponseItem } from 'src/shared/api-sports/api/soccer/schemas/fixtures/fixtures.schema';
import { FusedMatchData } from '../schemas/fusedMatchData.schema';
import { TheSportsDbEvent } from '../schemas/theSportsDb.schema';
import { mapStrStatusToMatchStatus } from './../../../../shared/thesportsdb-api/helpers/mapStatusToEvent.helper';

export class FutebolDataMapper {
  static toFusedMatchData(
    apiSportsData: FixtureResponseItem,
    tsdbData: TheSportsDbEvent,
  ): FusedMatchData {
    const parseScore = (score: string | null | undefined): number | null => {
      if (!score) return null;
      const parsed = parseInt(score, 10);
      return isNaN(parsed) ? null : parsed;
    };
    // --- Scores ---
    const homeScoreFT =
      apiSportsData.score.fulltime.home ??
      parseScore(tsdbData.intHomeScore) ??
      null;

    const awayScoreFT =
      apiSportsData.score.fulltime.away ??
      parseScore(tsdbData.intAwayScore) ??
      null;

    // --- Status ---
    const status = mapStrStatusToMatchStatus(tsdbData.strStatus ?? '');

    // --- Badges ---
    const homeTeamBadge =
      tsdbData.strHomeTeamBadge || apiSportsData.teams.home.logo || null;

    const awayTeamBadge =
      tsdbData.strAwayTeamBadge || apiSportsData.teams.away.logo || null;

    // --- Postponed ---
    const isPostponed =
      apiSportsData.fixture.status.short === 'PST' ||
      apiSportsData.fixture.status.short === 'CANC';

    return {
      // --- Identificadores ---
      apiSportsEventId: apiSportsData.fixture.id.toString(),
      tsdbEventId: tsdbData.idEvent,

      // --- Datas e Status ---
      eventDate: new Date(apiSportsData.fixture.date),
      timezone: apiSportsData.fixture.timezone,
      status,
      isPostponed,

      // --- Times ---
      homeTeam: apiSportsData.teams.home.name,
      awayTeam: apiSportsData.teams.away.name,
      homeTeamBadge,
      awayTeamBadge,

      // --- Placar ---
      homeScoreHT: apiSportsData.score.halftime.home,
      awayScoreHT: apiSportsData.score.halftime.away,
      homeScoreFT,
      awayScoreFT,

      // --- Metadados ---
      venue: apiSportsData.fixture.venue?.name ?? tsdbData.strVenue ?? null,
      league: apiSportsData.league?.name ?? tsdbData.strLeague ?? null,
      country: apiSportsData.league?.country ?? tsdbData.strCountry ?? null,
      thumbnail: tsdbData.strThumb ?? null,

      // --- Sync ---
      sport: 'Soccer',
      lastSyncAt: new Date(),
    };
  }
}
