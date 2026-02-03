import { SoccerService } from './../../../shared/api-sports/api/soccer/services/soccer.service';
import { TheSportsDbLeaguesService } from './../../../shared/thesportsdb-api/services/leagues-thesportsdb.service';

export async function getCurrentSeasonTsdb(
  leagueDbService: TheSportsDbLeaguesService,
  leagueId: string,
): Promise<string | undefined> {
  const league = await leagueDbService.getLeagueById(leagueId);
  return league?.strCurrentSeason;
}

export async function getCurrentSeasonApiSports(
  apiSportsService: SoccerService,
  leagueId: number,
): Promise<string | undefined> {
  const leaguesResponse = await apiSportsService.getLeagues();
  const league = leaguesResponse.response?.find(
    (l) => l.league.id === leagueId,
  );
  const currentSeason = league?.seasons?.find((s) => s.current);
  return currentSeason ? String(currentSeason.year) : undefined;
}
