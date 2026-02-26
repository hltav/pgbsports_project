import { Injectable, Logger } from '@nestjs/common';
import { DiscoverLeague } from '../schemas/discoveryLeague.schema';
import { CacheService } from './../../../../libs/services/cache/cache.service';
import { CACHE_TTL } from './../../../../libs/utils/cache.constants';
import { LeagueDiscoveryService } from './leagueDiscovery.service';
import { LeagueTranslationService } from './leagueTranslation.service';
import { MAIN_COUNTRIES } from '../utils/internationalCompetitionsRegion';
import {
  CountryGroup,
  OrganizedLeaguesResponse,
} from '../interfaces/organized.interface';
import { moveWorldLeaguesToContinents } from '../functions/moveWorldLeaguesToContinents';

type MainCountry = (typeof MAIN_COUNTRIES)[number];

const isMainCountry = (country: string): country is MainCountry => {
  return (MAIN_COUNTRIES as readonly string[]).includes(country);
};

@Injectable()
export class LeagueOrganizationService {
  private readonly logger = new Logger(LeagueOrganizationService.name);

  constructor(
    private readonly cache: CacheService,
    private readonly leagueDiscoveryService: LeagueDiscoveryService,
    private readonly leagueTranslation: LeagueTranslationService,
  ) {}

  // 🎯 MÉTODO PRINCIPAL
  async getOrganizedLeagues(params?: {
    season?: number | 'current';
    forceRefresh?: boolean;
  }): Promise<OrganizedLeaguesResponse> {
    const cacheKey = this.generateCacheKey(params?.season);

    if (params?.forceRefresh) {
      await this.cache.del(cacheKey);
    }

    const cached = await this.cache.get<OrganizedLeaguesResponse>(cacheKey);
    if (cached) {
      this.logger.log(`Cache HIT: ${cacheKey}`);
      return cached;
    }

    this.logger.log(`Cache MISS: ${cacheKey}`);

    const leaguesRaw = await this.fetchLeagues(params?.season);

    // ✅ transformação única e centralizada
    const leagues = this.applyTransforms(leaguesRaw);

    const organized = this.organizeLeagues(leagues);

    await this.cache.set(cacheKey, organized, CACHE_TTL.DISCOVERY_1_MONTH);

    return organized;
  }

  // Busca ligas
  private async fetchLeagues(
    season?: number | 'current',
  ): Promise<DiscoverLeague[]> {
    if (season !== undefined) {
      return this.leagueDiscoveryService.discoverLeaguesBySeason(season);
    }
    return this.leagueDiscoveryService.discoverLeagues();
  }

  // Aplica:
  // country canonical
  // tradução robusta do nome da liga
  private applyTransforms(leagues: DiscoverLeague[]): DiscoverLeague[] {
    return leagues.map((league) => {
      const originalName = league.name;

      const normalizedCountry = this.leagueTranslation.translateCountryName(
        league.country ?? '',
      );

      const translation = this.leagueTranslation.getTranslation(
        originalName,
        normalizedCountry,
      );

      return {
        ...league,
        country: normalizedCountry,
        name: translation.name ?? originalName,
        logo:
          this.leagueTranslation.getLeagueLogo(
            originalName,
            normalizedCountry,
            league.logo,
          ) ?? '',
      };
    });
  }

  // Organização pura
  private organizeLeagues(leagues: DiscoverLeague[]): OrganizedLeaguesResponse {
    const groupedByCountry = this.groupByCountry(leagues);

    moveWorldLeaguesToContinents(groupedByCountry);

    const mainCountries = this.extractMainCountries(groupedByCountry);
    const otherCountries = this.extractOtherCountries(groupedByCountry);

    return {
      mainCountries,
      otherCountries,
      metadata: {
        totalCountries: Object.keys(groupedByCountry).length,
        totalLeagues: leagues.length,
        mainCountriesCount: mainCountries.length,
        otherCountriesCount: otherCountries.length,
        cachedAt: new Date().toISOString(),
      },
    };
  }

  private groupByCountry(
    leagues: DiscoverLeague[],
  ): Record<string, DiscoverLeague[]> {
    return leagues.reduce<Record<string, DiscoverLeague[]>>((acc, league) => {
      if (!acc[league.country]) {
        acc[league.country] = [];
      }
      acc[league.country].push(league);
      return acc;
    }, {});
  }

  private extractMainCountries(
    groupedByCountry: Record<string, DiscoverLeague[]>,
  ): CountryGroup[] {
    return MAIN_COUNTRIES.map((country) => {
      const leagues = groupedByCountry[country] ?? [];
      return {
        country,
        flag: leagues[0]?.flag || null,
        leagues,
        leagueCount: leagues.length,
      };
    }).filter((group) => group.leagueCount > 0);
  }

  private extractOtherCountries(
    groupedByCountry: Record<string, DiscoverLeague[]>,
  ): CountryGroup[] {
    return (
      Object.keys(groupedByCountry)
        // 3. O filter agora usa a função de checagem sem precisar de 'as any'
        .filter((country) => !isMainCountry(country))
        .sort((a, b) => a.localeCompare(b))
        .map((country) => {
          // 4. Como country é uma chave de groupedByCountry, pegamos as ligas
          const leagues = groupedByCountry[country];

          return {
            country,
            flag: leagues[0]?.flag || null,
            leagues,
            leagueCount: leagues.length,
          };
        })
    );
  }

  // Cache versionado
  private generateCacheKey(season?: number | 'current'): string {
    const v = 'v2';

    if (season === 'current') {
      return `discovery:leagues:organized:${v}:current`;
    }
    if (season) {
      return `discovery:leagues:organized:${v}:season:${season}`;
    }
    return `discovery:leagues:organized:${v}:all`;
  }

  // Warmup
  async warmupCache() {
    this.logger.log('🔥 Iniciando warmup do cache de ligas organizadas...');

    try {
      await this.getOrganizedLeagues();
      await this.getOrganizedLeagues({ season: 'current' });

      const currentYear = new Date().getFullYear();
      for (const year of [currentYear, currentYear - 1]) {
        await this.getOrganizedLeagues({ season: year });
      }

      this.logger.log('🎉 Warmup concluído!');
    } catch (error) {
      this.logger.error(
        `❌ Erro no warmup: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async invalidateCache(season?: number | 'current') {
    const cacheKey = this.generateCacheKey(season);
    await this.cache.del(cacheKey);
    this.logger.log(`🗑️ Cache invalidado: ${cacheKey}`);
  }

  async invalidateAllCache() {
    this.logger.log('🗑️ Invalidando todo cache de ligas organizadas...');

    await this.cache.del(this.generateCacheKey());
    await this.cache.del(this.generateCacheKey('current'));

    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear + 1; year++) {
      await this.cache.del(this.generateCacheKey(year));
    }

    this.logger.log('✅ Cache invalidado com sucesso');
  }
}
