import { League as TsdbLeague } from './../../../../shared/thesportsdb-api/schemas/allLeagues/allLeagues.schema';
import { LeagueResponseItem } from './../../../../shared/api-sports/api/soccer/schemas/leagues/leagues.schema';
import { DiscoverLeague } from '../schemas/discoveryLeague.schema';
import { normalizeCountry } from '../../helpers/normalizeCountryName.helper';
import { translateCountry } from '../utils/translateCountryNames';

export class LeagueDiscoveryMapper {
  static fromSources(
    apiLeague: LeagueResponseItem | null,
    tsdbLeague: TsdbLeague | null,
  ): DiscoverLeague {
    const apiSeason = apiLeague?.seasons?.find((s) => s.current);
    const hasApiSports = Boolean(apiLeague);
    const hasTsdb = Boolean(tsdbLeague);

    const apiCountry = apiLeague?.country?.name
      ? normalizeCountry(apiLeague.country.name)
      : null;

    const tsdbCountry = tsdbLeague?.strCountry
      ? normalizeCountry(tsdbLeague.strCountry)
      : null;

    // 🔒 Confiança agora depende também do país
    let confidence = 0;
    if (hasApiSports && hasTsdb) {
      confidence =
        apiCountry && tsdbCountry && apiCountry === tsdbCountry ? 1 : 0.75;
    } else if (hasApiSports) {
      confidence = 0.85;
    } else if (hasTsdb) {
      confidence = 0.6;
    }

    const rawCountryName = apiLeague?.country?.name ?? tsdbLeague?.strCountry;

    return {
      previewId:
        hasApiSports && hasTsdb
          ? `fused:${apiLeague!.league.id}:${tsdbLeague!.idLeague}`
          : hasApiSports
            ? `aps:${apiLeague!.league.id}`
            : `tsdb:${tsdbLeague!.idLeague}`,
      apiSportsLeagueId: apiLeague?.league.id,
      tsdbLeagueId: tsdbLeague?.idLeague,
      name: tsdbLeague?.strLeague ?? apiLeague?.league.name ?? 'Unknown league',
      country: translateCountry(rawCountryName),
      logo: apiLeague?.league.logo ?? tsdbLeague?.strBadge ?? undefined,
      flag: apiLeague?.country.flag ?? undefined,
      badge: tsdbLeague?.strBadge ?? undefined,
      banner: tsdbLeague?.strBanner ?? undefined,
      season: apiSeason?.year,
      isCurrent: apiSeason?.current ?? undefined,
      highlighted: apiSeason?.current ?? false,
      seasonRange:
        tsdbLeague?.strCurrentSeason ??
        (apiSeason?.start && apiSeason?.end
          ? `${apiSeason.start.slice(0, 4)}-${apiSeason.end.slice(0, 4)}`
          : undefined),
      hasFixtures: Boolean(apiSeason?.coverage?.fixtures?.events),
      hasStandings: Boolean(apiSeason?.coverage?.standings),
      hasOdds: Boolean(apiSeason?.coverage?.odds),
      sources: {
        apiSports: hasApiSports,
        theSportsDb: hasTsdb,
      },
      confidence,
      sourcePriority:
        hasApiSports && hasTsdb ? 'BOTH' : hasApiSports ? 'API_SPORTS' : 'TSDB',
    };
  }
}
