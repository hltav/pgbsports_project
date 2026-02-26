import { LookupEvent } from './../../../../shared/thesportsdb-api/schemas/allEvents/allEvents.schema';
import { DiscoverFixture } from '../schemas/discoveryFixture.schema';
import { ApiSportsFixture } from './../../../../shared/api-sports/api/soccer/schemas/fixtures/apiSportsFixture.scheme';
import { DiscoverLeague } from '../schemas/discoveryLeague.schema';
import { resolveCanonicalTeamName } from '../../helpers/nomalizeTeamName.helper';

export class SoccerDiscoveryMapper {
  static fromSources(
    apiFixture: ApiSportsFixture | null,
    tsdbMatch: LookupEvent | null,
    translatedLeague?: DiscoverLeague,
  ): DiscoverFixture {
    const hasApiSports = Boolean(apiFixture);
    const hasTsdb = Boolean(tsdbMatch);

    const apiId = apiFixture?.fixture.id ?? null;
    const tsdbId = tsdbMatch?.idEvent ?? null;

    const previewId =
      hasApiSports && hasTsdb
        ? `fused:${apiId}:${tsdbId}`
        : hasApiSports
          ? `aps:${apiId}`
          : tsdbId
            ? `tsdb:${tsdbId}`
            : 'unknown';

    const confidence =
      hasApiSports && hasTsdb ? 0.95 : hasApiSports ? 0.85 : hasTsdb ? 0.6 : 0;

    return {
      previewId,

      apiSportsEventId: apiId,
      tsdbEventId: tsdbId,

      league: hasApiSports
        ? {
            id: apiFixture!.league.id,
            name: translatedLeague?.name || apiFixture!.league.name,
            flag: apiFixture!.league.flag,
            logo: translatedLeague?.logo || apiFixture!.league.logo,
          }
        : {
            id: Number(tsdbMatch?.idLeague ?? 0),
            name: tsdbMatch?.strLeague ?? 'Unknown league',
            flag: undefined,
            logo: undefined,
          },

      season: apiFixture?.league.season ?? null,
      date:
        apiFixture?.fixture.date ??
        (tsdbMatch?.strTimestamp ? `${tsdbMatch.strTimestamp}Z` : ''),
      status: apiFixture?.fixture.status.short ?? tsdbMatch?.strStatus ?? 'UNK',

      teams: {
        home: {
          name: resolveCanonicalTeamName(
            apiFixture?.teams.home.name ?? tsdbMatch?.strHomeTeam ?? 'Unknown',
          ),
          logo: apiFixture?.teams.home.logo ?? undefined,
        },
        away: {
          name: resolveCanonicalTeamName(
            apiFixture?.teams.away.name ?? tsdbMatch?.strAwayTeam ?? 'Unknown',
          ),
          logo: apiFixture?.teams.away.logo ?? undefined,
        },
      },

      sources: {
        apiSports: hasApiSports,
        theSportsDb: hasTsdb,
      },

      confidence,
      canRegister: true,

      sourcePriority:
        hasApiSports && hasTsdb
          ? 'BOTH'
          : hasApiSports
            ? 'API_SPORTS'
            : hasTsdb
              ? 'TSDB'
              : 'NONE',
    };
  }
}
