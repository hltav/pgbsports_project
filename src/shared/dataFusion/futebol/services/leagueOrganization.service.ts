// import { Injectable, Logger } from '@nestjs/common';
// import { DiscoverLeague } from '../schemas/discoveryLeague.schema';
// import { CacheService } from './../../../../libs/services/cache/cache.service';
// import { CACHE_TTL } from './../../../../libs/utils/cache.constants';
// import { LeagueDiscoveryService } from './leagueDiscovery.service';

// const MAIN_COUNTRIES = [
//   'Brasil',
//   'World',
//   'Europa',
//   'América do Sul',
//   'América do Norte, Central e Caribe',
//   'Asia',
//   'África',
//   'Oceania',
//   'Inglaterra',
//   'Espanha',
//   'Alemanha',
//   'Italia',
//   'França',
//   'Países Baixos',
//   'Portugal',
// ];

// export interface OrganizedLeaguesResponse {
//   mainCountries: CountryGroup[];
//   otherCountries: CountryGroup[];
//   metadata: {
//     totalCountries: number;
//     totalLeagues: number;
//     mainCountriesCount: number;
//     otherCountriesCount: number;
//     cachedAt: string;
//   };
// }

// export interface CountryGroup {
//   country: string;
//   flag: string | null;
//   leagues: DiscoverLeague[];
//   leagueCount: number;
// }

// @Injectable()
// export class LeagueOrganizationService {
//   private readonly logger = new Logger(LeagueOrganizationService.name);

//   constructor(
//     private readonly cache: CacheService,
//     private readonly leagueDiscoveryService: LeagueDiscoveryService,
//   ) {}

//   /**
//    * 🎯 MÉTODO PRINCIPAL: Busca ligas organizadas
//    * Usa o LeagueDiscoveryService existente + organização
//    */
//   async getOrganizedLeagues(params?: {
//     season?: number | 'current';
//     forceRefresh?: boolean;
//   }): Promise<OrganizedLeaguesResponse> {
//     const cacheKey = this.generateCacheKey(params?.season);

//     // Force refresh bypassa o cache
//     if (params?.forceRefresh) {
//       await this.cache.del(cacheKey);
//     }

//     // Tenta buscar do cache
//     const cached = await this.cache.get<OrganizedLeaguesResponse>(cacheKey);
//     if (cached) {
//       this.logger.log(`Cache HIT: ${cacheKey}`);
//       return cached;
//     }

//     this.logger.log(`Cache MISS: ${cacheKey}`);

//     // Busca ligas usando o service existente
//     const leagues = await this.fetchLeagues(params?.season);

//     // Organiza os dados
//     const organized = this.organizeLeagues(leagues);

//     // Salva no cache por 7 dias (ligas mudam pouco)
//     await this.cache.set(cacheKey, organized, CACHE_TTL.DISCOVERY_1_MONTH);

//     return organized;
//   }

//   /**
//    * Busca ligas usando o LeagueDiscoveryService existente
//    */
//   private async fetchLeagues(
//     season?: number | 'current',
//   ): Promise<DiscoverLeague[]> {
//     if (season !== undefined) {
//       return this.leagueDiscoveryService.discoverLeaguesBySeason(season);
//     }
//     return this.leagueDiscoveryService.discoverLeagues();
//   }

//   /**
//    * Organiza as ligas por país (lógica pura)
//    */
//   private organizeLeagues(leagues: DiscoverLeague[]): OrganizedLeaguesResponse {
//     // Agrupa ligas por país
//     const groupedByCountry = this.groupByCountry(leagues);

//     // Separa países principais
//     const mainCountries = this.extractMainCountries(groupedByCountry);

//     // Separa outros países (ordenados alfabeticamente)
//     const otherCountries = this.extractOtherCountries(groupedByCountry);

//     // Monta metadata
//     const metadata = {
//       totalCountries: Object.keys(groupedByCountry).length,
//       totalLeagues: leagues.length,
//       mainCountriesCount: mainCountries.filter((c) => c.leagueCount > 0).length,
//       otherCountriesCount: otherCountries.length,
//       cachedAt: new Date().toISOString(),
//     };

//     return {
//       mainCountries,
//       otherCountries,
//       metadata,
//     };
//   }

//   /**
//    * Agrupa ligas por país
//    */
//   private groupByCountry(
//     leagues: DiscoverLeague[],
//   ): Record<string, DiscoverLeague[]> {
//     return leagues.reduce(
//       (acc, league) => {
//         if (!acc[league.country]) {
//           acc[league.country] = [];
//         }
//         acc[league.country].push(league);
//         return acc;
//       },
//       {} as Record<string, DiscoverLeague[]>,
//     );
//   }

//   /**
//    * Extrai e formata países principais
//    */
//   private extractMainCountries(
//     groupedByCountry: Record<string, DiscoverLeague[]>,
//   ): CountryGroup[] {
//     return MAIN_COUNTRIES.map((country) => {
//       const leagues = groupedByCountry[country] || [];
//       return {
//         country,
//         flag: leagues[0]?.flag || null,
//         leagues,
//         leagueCount: leagues.length,
//       };
//     }).filter((group) => group.leagueCount > 0); // Remove países sem ligas
//   }

//   /**
//    * Extrai e formata outros países (excluindo principais)
//    */
//   private extractOtherCountries(
//     groupedByCountry: Record<string, DiscoverLeague[]>,
//   ): CountryGroup[] {
//     return Object.keys(groupedByCountry)
//       .filter((country) => !MAIN_COUNTRIES.includes(country))
//       .sort()
//       .map((country) => {
//         const leagues = groupedByCountry[country];
//         return {
//           country,
//           flag: leagues[0]?.flag || null,
//           leagues,
//           leagueCount: leagues.length,
//         };
//       });
//   }

//   /**
//    * Gera chave de cache consistente
//    */
//   private generateCacheKey(season?: number | 'current'): string {
//     if (season === 'current') {
//       return 'discovery:leagues:organized:current';
//     }
//     if (season) {
//       return `discovery:leagues:organized:season:${season}`;
//     }
//     return 'discovery:leagues:organized:all';
//   }

//   /**
//    * Pré-aquecimento do cache (warmup)
//    */
//   async warmupCache() {
//     this.logger.log('🔥 Iniciando warmup do cache de ligas organizadas...');

//     try {
//       // Warmup para todas as ligas
//       await this.getOrganizedLeagues();
//       this.logger.log('✅ Warmup completo: todas as ligas');

//       // Warmup para temporada atual
//       await this.getOrganizedLeagues({ season: 'current' });
//       this.logger.log('✅ Warmup completo: temporada atual');

//       // Warmup para temporadas recentes
//       const currentYear = new Date().getFullYear();
//       for (const year of [currentYear, currentYear - 1]) {
//         await this.getOrganizedLeagues({ season: year });
//         this.logger.log(`✅ Warmup completo: temporada ${year}`);
//       }

//       this.logger.log('🎉 Warmup do cache concluído!');
//     } catch (error) {
//       const msg = error instanceof Error ? error.message : String(error);
//       this.logger.error(`❌ Erro no warmup: ${msg}`);
//     }
//   }

//   /**
//    * Invalida cache de ligas organizadas
//    */
//   async invalidateCache(season?: number | 'current') {
//     const cacheKey = this.generateCacheKey(season);
//     await this.cache.del(cacheKey);
//     this.logger.log(`🗑️ Cache invalidado: ${cacheKey}`);
//   }

//   /**
//    * Invalida todo o cache de ligas organizadas
//    */
//   async invalidateAllCache() {
//     this.logger.log('🗑️ Invalidando todo cache de ligas organizadas...');

//     // Invalida cache organizado
//     await this.cache.del('discovery:leagues:organized:all');
//     await this.cache.del('discovery:leagues:organized:current');

//     // Invalida temporadas conhecidas
//     const currentYear = new Date().getFullYear();
//     for (let year = currentYear - 5; year <= currentYear + 1; year++) {
//       await this.cache.del(`discovery:leagues:organized:season:${year}`);
//     }

//     this.logger.log('✅ Cache invalidado com sucesso');
//   }
// }
import { Injectable, Logger } from '@nestjs/common';
import { DiscoverLeague } from '../schemas/discoveryLeague.schema';
import { CacheService } from './../../../../libs/services/cache/cache.service';
import { CACHE_TTL } from './../../../../libs/utils/cache.constants';
import { LeagueDiscoveryService } from './leagueDiscovery.service';
import { LeagueTranslationService } from './leagueTranslation.service';
import { countryLookup, baseNormalize } from '../utils/countryLookup';
import { COUNTRY_CANONICAL_MAP } from '../utils/countryAliases';
import {
  COUNTRY_LABEL_PT,
  MAIN_COUNTRIES,
} from '../utils/internationalCompetitionsRegion';
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

  /**
   * 🎯 MÉTODO PRINCIPAL
   */
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

  /**
   * Busca ligas
   */
  private async fetchLeagues(
    season?: number | 'current',
  ): Promise<DiscoverLeague[]> {
    if (season !== undefined) {
      return this.leagueDiscoveryService.discoverLeaguesBySeason(season);
    }
    return this.leagueDiscoveryService.discoverLeagues();
  }

  /**
   * ✅ Aplica:
   * - country canonical
   * - tradução robusta do nome da liga
   */
  private applyTransforms(leagues: DiscoverLeague[]): DiscoverLeague[] {
    return leagues.map((league) => {
      // Nome original (garantido pelo schema)
      const originalName = league.name;
      // Tradução robusta da liga
      const translation = this.leagueTranslation.getTranslation(originalName);
      // Country normalizado
      const normalizedCountry = this.leagueTranslation.translateCountryName(
        league.country,
      );

      return {
        ...league,
        // País canônico (para agrupamento)
        country: normalizedCountry,
        // Nome traduzido (mantém original se não houver tradução)
        name: translation.name ?? originalName,
        // Prioriza assets da tradução se existirem
        logo:
          this.leagueTranslation.getLeagueLogo(originalName, league.logo) ?? '',
      };
    });
  }

  /**
   * Converte qualquer string de país (API / alias / ISO / PT)
   * para um label consistente
   */
  private normalizeCountryLabel(country: string): string {
    const normalized = baseNormalize(country);
    const key = countryLookup.get(normalized);

    console.log('Normalizing country:', { country, normalized, key });

    if (!key) {
      // Continentes ou valores fora do map
      return country;
    }

    return (
      COUNTRY_LABEL_PT[key] ??
      COUNTRY_CANONICAL_MAP[key].theSportsDB ??
      COUNTRY_CANONICAL_MAP[key].apiFootball ??
      country
    );
  }

  /**
   * Organização pura
   */
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

  /**
   * Cache versionado
   */
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

  /**
   * Warmup
   */
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
