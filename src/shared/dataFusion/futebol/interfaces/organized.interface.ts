import { DiscoverLeague } from '../schemas/discoveryLeague.schema';

export interface OrganizedLeaguesResponse {
  mainCountries: CountryGroup[];
  otherCountries: CountryGroup[];
  metadata: {
    totalCountries: number;
    totalLeagues: number;
    mainCountriesCount: number;
    otherCountriesCount: number;
    cachedAt: string;
  };
}

export interface CountryGroup {
  country: string;
  flag: string | null;
  leagues: DiscoverLeague[];
  leagueCount: number;
}
