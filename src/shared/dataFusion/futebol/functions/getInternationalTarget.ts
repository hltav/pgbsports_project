import {
  INTERNATIONAL_REGION_BY_APS,
  INTERNATIONAL_REGION_BY_TSDB,
  MainCountry,
} from '../utils/internationalCompetitionsRegion';
import { DiscoverLeague } from '../schemas/discoveryLeague.schema';

export function getInternationalTarget(
  league: DiscoverLeague,
): MainCountry | null {
  // prioridade: se tiver APS, usa APS; se tiver TSDB, usa TSDB
  if (league.apiSportsLeagueId) {
    const t = INTERNATIONAL_REGION_BY_APS[league.apiSportsLeagueId];
    if (t) return t;
  }

  if (league.tsdbLeagueId) {
    const tsdbId = Number(league.tsdbLeagueId);
    if (!Number.isNaN(tsdbId)) {
      const t = INTERNATIONAL_REGION_BY_TSDB[tsdbId];
      if (t) return t;
    }
  }

  return null;
}
