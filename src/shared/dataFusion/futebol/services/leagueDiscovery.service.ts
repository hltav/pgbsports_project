/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable } from '@nestjs/common';
import { TheSportsDbLeaguesService } from './../../../../shared/thesportsdb-api/services/leagues-thesportsdb.service';
import { League as TsdbLeague } from './../../../../shared/thesportsdb-api/schemas/allLeagues/allLeagues.schema';
import { DiscoverLeague } from '../schemas/discoveryLeague.schema';
import { LeagueDiscoveryMapper } from '../mappers/leaguesDiscovery.mapper';
import {
  getCleanLeagueName,
  normalizeTeamName,
} from '../../helpers/nomalizeTeamName.helper';
import { CacheService } from './../../../../libs/services/cache/cache.service';
import { SoccerService } from './../../../../shared/api-sports/api/soccer/services/soccer.service';
import { LeagueResponseItem } from './../../../../shared/api-sports/api/soccer/schemas/leagues/leagues.schema';
import { normalizeCountry } from '../../helpers/normalizeCountryName.helper';
import { extractCountryFromLeagueName } from '../utils/countryAdjectivesMap';
import { parseSeason } from './../../../../shared/thesportsdb-api/utils/parseSeason.util';
import { isActiveSeasonNow } from '../../helpers/activeSeason.helper';
import { API1_TO_API2_MAPPING } from '../utils/apiManualMapping';

// Criamos um tipo estendido para lidar com a propriedade extra da API de forma segura
type TsdbLeagueWithApiId = Omit<TsdbLeague, 'idLeague'> & {
  idLeague?: string | null;
};

interface TsdbMaps {
  idMap: Map<string, TsdbLeague>;
  nameMap: Map<string, TsdbLeague>;
  nameCountryMap: Map<string, TsdbLeague>;
}

@Injectable()
export class LeagueDiscoveryService {
  constructor(
    private readonly apiSportsService: SoccerService,
    private readonly tsdbLeaguesService: TheSportsDbLeaguesService,
    private readonly cache: CacheService,
  ) {}

  async discoverLeagues(): Promise<DiscoverLeague[]> {
    const apiLeaguesResponse = await this.apiSportsService.getLeagues();
    const apiLeagues = apiLeaguesResponse.response ?? [];
    if (!apiLeagues.length) return [];

    const tsdbLeagues = await this.tsdbLeaguesService.getSoccerLeagues();
    const maps = this.buildTsdbMap(tsdbLeagues);

    const discovered = apiLeagues.map((apiLeague) => {
      const tsdbMatch = this.tryMatchWithMap(apiLeague, maps, tsdbLeagues);
      return LeagueDiscoveryMapper.fromSources(apiLeague, tsdbMatch);
    });

    return discovered;
  }

  async discoverLeaguesBySeason(
    season: number | 'current',
  ): Promise<DiscoverLeague[]> {
    const apiLeaguesResponse = await this.apiSportsService.getLeagues();
    const apiLeagues = apiLeaguesResponse.response ?? [];

    const filteredApiLeagues = apiLeagues.filter((league) =>
      league.seasons?.some((s) => {
        if (season === 'current') {
          return isActiveSeasonNow(s);
        }

        if (typeof season === 'number' && s.start && s.end) {
          const startYear = new Date(s.start).getFullYear();
          const endYear = new Date(s.end).getFullYear();
          return startYear === season || endYear === season;
        }

        return false;
      }),
    );

    if (!filteredApiLeagues.length) return [];

    const tsdbLeagues = await this.tsdbLeaguesService.getSoccerLeagues();
    const maps = this.buildTsdbMap(tsdbLeagues);

    const discovered = filteredApiLeagues.map((apiLeague) => {
      const tsdbMatch = this.tryMatchWithMap(apiLeague, maps, tsdbLeagues);
      return LeagueDiscoveryMapper.fromSources(apiLeague, tsdbMatch);
    });

    return discovered;
  }

  async discoverLeaguesByQuery(season?: string) {
    const parsed = parseSeason(season);

    if (!parsed) return this.discoverLeagues();
    return this.discoverLeaguesBySeason(parsed);
  }

  async getLeagueMappingByApiId(
    apiSportsLeagueId: number,
    season?: number,
  ): Promise<{
    tsdbLeagueId: string;
    seasonRange: string;
    season?: number;
    previewId?: string;
  } | null> {
    const keysToTry: string[] = [];
    if (season) {
      keysToTry.push(`discovery:leagues:season:${season}`);
    }
    keysToTry.push(`discovery:leagues:current`);

    for (const key of keysToTry) {
      let leagues = await this.cache.get<DiscoverLeague[]>(key);
      // if (!leagues) continue;

      if (!leagues) {
        // 🔥 Auto-warmup
        if (key.includes('season')) {
          const season = Number(key.split(':').pop());
          leagues = await this.discoverLeaguesBySeason(season);
        } else {
          leagues = await this.discoverLeaguesBySeason('current');
        }
      }

      const league = leagues.find(
        (
          l,
        ): l is DiscoverLeague & {
          tsdbLeagueId: string;
          seasonRange: string;
        } =>
          l.apiSportsLeagueId === apiSportsLeagueId &&
          typeof l.tsdbLeagueId === 'string' &&
          typeof l.seasonRange === 'string',
      );

      if (league) {
        return {
          tsdbLeagueId: league.tsdbLeagueId,
          seasonRange: league.seasonRange,
          season: league.season,
          previewId: league.previewId,
        };
      }
    }

    return null;
  }

  private buildTsdbMap(leagues: TsdbLeague[]): TsdbMaps {
    const idMap = new Map<string, TsdbLeague>();
    const nameMap = new Map<string, TsdbLeague>();
    const nameCountryMap = new Map<string, TsdbLeague>();

    for (const l of leagues) {
      // 🚫 trava esporte
      if (l.strSport !== 'Soccer') continue;

      if ((l as TsdbLeagueWithApiId).idLeague) {
        idMap.set(String((l as TsdbLeagueWithApiId).idLeague), l);
      }

      const extractedCountry =
        extractCountryFromLeagueName(l.strLeague) ||
        normalizeCountry(l.strCountry || '');

      const cleanTsdbName = getCleanLeagueName(l.strLeague);

      if (extractedCountry) {
        const key = `${cleanTsdbName}|${extractedCountry}`;
        if (!nameCountryMap.has(key)) {
          nameCountryMap.set(key, l);
        }
      }

      if (!nameMap.has(cleanTsdbName)) {
        nameMap.set(cleanTsdbName, l);
      }

      if (l.strLeagueAlternate) {
        l.strLeagueAlternate.split(',').forEach((alt) => {
          const cleanAlt = normalizeTeamName(alt.trim());

          if (!nameMap.has(cleanAlt)) {
            nameMap.set(cleanAlt, l);
          }

          if (extractedCountry) {
            const altKey = `${cleanAlt}|${extractedCountry}`;
            if (!nameCountryMap.has(altKey)) {
              nameCountryMap.set(altKey, l);
            }
          }
        });
      }
    }

    return { idMap, nameMap, nameCountryMap };
  }

  private tryMatchWithMap(
    apiLeague: LeagueResponseItem,
    maps: TsdbMaps,
    originalArray: TsdbLeague[],
  ): TsdbLeague | null {
    const apiSportsId = apiLeague.league.id;

    // 1. Prioridade Máxima: Mapeamento Estático (API1 -> API2)
    const mappedTsdbId = API1_TO_API2_MAPPING[apiSportsId];
    if (mappedTsdbId) {
      // Buscamos no idMap da TSDB usando o ID mapeado
      const match = maps.idMap.get(String(mappedTsdbId));
      if (match) return match;
    }

    // 2. Tenta ID
    const byId = maps.idMap.get(String(apiSportsId));
    if (byId) return byId;

    // 3. Tenta Nome Limpo + País (A API-Sports já manda separado)
    const apiCountry = normalizeCountry(apiLeague.country.name);
    const apiLeagueName = getCleanLeagueName(apiLeague.league.name);

    // 4. Fallback: Nome apenas
    const key = `${apiLeagueName}|${apiCountry}`;
    const byNameCountry = maps.nameCountryMap.get(key);
    if (byNameCountry) return byNameCountry;

    return null;
  }
}
