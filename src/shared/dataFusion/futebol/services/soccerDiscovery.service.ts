/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { SoccerService } from './../../../../shared/api-sports/api/soccer/services/soccer.service';
import { TheSportsDbEventsService } from './../../../../shared/thesportsdb-api/services/events-thesportsdb.service';
import { SoccerDiscoveryMapper } from '../mappers/futebolDiscovery.mapper';
import { DiscoverFixture } from '../schemas/discoveryFixture.schema';
import { LookupEvent } from './../../../../shared/thesportsdb-api/schemas/allEvents/allEvents.schema';
import { ApiSportsFixture } from './../../../../shared/api-sports/api/soccer/schemas/fixtures/apiSportsFixture.scheme';
import { CacheService } from './../../../../libs/services/cache/cache.service';
import {
  areTeamsEquivalent,
  normalizeTeamName,
} from '../../helpers/nomalizeTeamName.helper';
import { CACHE_TTL } from './../../../../libs/utils/cache.constants';
import { LeagueOrganizationService } from './leagueOrganization.service';
import { DiscoverLeague } from '../schemas/discoveryLeague.schema';

interface LeagueMapping {
  tsdbLeagueId: string;
  seasonRange: string;
}

interface DiscoveryContext {
  tsdbEventsByDate: Map<string, LookupEvent[]>;
}

@Injectable()
export class SoccerDiscoveryService {
  private readonly logger = new Logger(SoccerDiscoveryService.name);

  constructor(
    private readonly cache: CacheService,
    private readonly apiSportsService: SoccerService,
    private readonly tsdbEventsService: TheSportsDbEventsService,
    private readonly leagueOrganizationService: LeagueOrganizationService,
  ) {}

  async discoverNextFixtures(
    league: number,
    next = 10,
  ): Promise<DiscoverFixture[]> {
    const apiFixtures = await this.loadApiFixtures(league, next);
    if (!apiFixtures.length) return [];

    const season = apiFixtures[0].league.season;
    const cacheKey = `discovery:league:${league}:next:${next}:season:${season}`;

    const cached = await this.cache.get<DiscoverFixture[]>(cacheKey);
    if (cached) return cached;

    // 1. Buscamos o mapeamento completo (técnico + tradução)
    const mappingResult = await this.getLeagueMapping(league, season);

    // 2. Se não houver mapeamento TSDB, mapeamos apenas com os dados da API + Tradução (se houver)
    if (!mappingResult) {
      const result = apiFixtures.map(
        (f) => SoccerDiscoveryMapper.fromSources(f, null, undefined), // Mapper tratará o fallback
      );
      await this.cache.set(cacheKey, result, CACHE_TTL.DISCOVERY_1_DAY);
      return result;
    }

    // 3. Se houver mapeamento, preparamos o contexto TSDB
    const context = await this.buildDiscoveryContext(
      apiFixtures,
      mappingResult, // Aqui TypeScript já entende que tem tsdbLeagueId e seasonRange
      season,
    );

    console.log('O que retorna?', context);

    // 4. Fusão final com dados traduzidos
    const fused = apiFixtures.map((fixture) => {
      const tsdbMatch = this.findMatch(fixture, context);
      return SoccerDiscoveryMapper.fromSources(
        fixture,
        tsdbMatch,
        mappingResult.translatedLeague, // Passando o objeto tipado DiscoverLeague
      );
    });

    await this.cache.set(cacheKey, fused, CACHE_TTL.DISCOVERY_1_DAY);
    return fused;
  }

  async getCurrentSeasonForLeague(league: number): Promise<number | null> {
    const cacheKey = `discovery:league:${league}:current-season`;

    const cached = await this.cache.get<number>(cacheKey);
    if (cached) return cached;

    // Busca apenas 1 fixture para detectar a season
    const apiFixtures = await this.loadApiFixtures(league, 1);

    if (!apiFixtures.length) return null;

    const currentSeason = apiFixtures[0].league.season;

    // Cache por 1 dia (a season atual pode mudar no meio do ano)
    await this.cache.set(cacheKey, currentSeason, CACHE_TTL.DISCOVERY_1_DAY);

    return currentSeason;
  }

  private async loadApiFixtures(
    league: number,
    next: number,
  ): Promise<ApiSportsFixture[]> {
    // Nota: Verifique se a temporada não deveria ser passada aqui também
    const data = await this.apiSportsService.getNextFixtures(
      league,
      undefined,
      next,
    );
    return data?.response ?? [];
  }

  private async buildDiscoveryContext(
    fixtures: ApiSportsFixture[],
    mapping: LeagueMapping,
    season: number,
  ): Promise<DiscoveryContext> {
    const uniqueDates = [
      ...new Set(
        fixtures.map((f) =>
          new Date(f.fixture.date).toISOString().slice(0, 10),
        ),
      ),
    ];

    // 🛠️ Normalização do seasonRange
    // Se for '2026-2026', vira '2026'. Se for '2025-2026', mantém.
    const [start, end] = mapping.seasonRange.split('-');
    const normalizedSeason = start === end ? start : mapping.seasonRange;

    this.logger.debug(
      `Buscando eventos TSDB. League: ${mapping.tsdbLeagueId}, Season Original: ${mapping.seasonRange}, Normalizada: ${normalizedSeason}`,
    );

    const tsdbEventsByDate =
      await this.tsdbEventsService.searchEventsByDateCached(
        uniqueDates,
        mapping.tsdbLeagueId,
        normalizedSeason, // <--- Passa a versão normalizada aqui
      );

    return { tsdbEventsByDate };
  }

  // 🔍 MATCH ENGINE
  private findMatch(
    fixture: ApiSportsFixture,
    context: DiscoveryContext,
  ): LookupEvent | null {
    const dateKey = new Date(fixture.fixture.date).toISOString().slice(0, 10);
    const events = context.tsdbEventsByDate.get(dateKey) ?? [];

    if (!events.length) return null;

    const homeOriginal = fixture.teams.home.name;
    const awayOriginal = fixture.teams.away.name;

    const homeNormalized = normalizeTeamName(homeOriginal);
    const awayNormalized = normalizeTeamName(awayOriginal);

    return (
      // 1️⃣ Alias (mais forte)
      events.find(
        (e) =>
          areTeamsEquivalent(e.strHomeTeam, homeOriginal) &&
          areTeamsEquivalent(e.strAwayTeam, awayOriginal),
      ) ??
      // 2️⃣ Exact match
      events.find(
        (e) =>
          normalizeTeamName(e.strHomeTeam) === homeNormalized &&
          normalizeTeamName(e.strAwayTeam) === awayNormalized,
      ) ??
      // 3️⃣ Contains
      events.find((e) =>
        this.isContainsMatch(e, homeNormalized, awayNormalized),
      ) ??
      // 4️⃣ Relaxed
      events.find((e) =>
        this.isRelaxedMatch(e, homeNormalized, awayNormalized),
      ) ??
      null
    );
  }

  private isExactMatch(e: LookupEvent, home: string, away: string): boolean {
    return (
      normalizeTeamName(e.strHomeTeam) === home &&
      normalizeTeamName(e.strAwayTeam) === away
    );
  }

  private isContainsMatch(e: LookupEvent, home: string, away: string): boolean {
    const eHome = normalizeTeamName(e.strHomeTeam);
    const eAway = normalizeTeamName(e.strAwayTeam);

    return (
      (eHome.includes(home) || home.includes(eHome)) &&
      (eAway.includes(away) || away.includes(eAway))
    );
  }

  private isRelaxedMatch(e: LookupEvent, home: string, away: string): boolean {
    const eHome = normalizeTeamName(e.strHomeTeam);
    const eAway = normalizeTeamName(e.strAwayTeam);

    return (
      this.partialWordMatch(home, eHome) && this.partialWordMatch(away, eAway)
    );
  }

  private partialWordMatch(a: string, b: string): boolean {
    return a
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .some((w) => b.includes(w));
  }

  // 🔗 LEAGUE MAPPING
  private async getLeagueMapping(
    apiSportsLeagueId: number,
    season?: number,
  ): Promise<(LeagueMapping & { translatedLeague: DiscoverLeague }) | null> {
    // Busca as ligas organizadas (que já chamam o Discovery internamente)
    const organized = await this.leagueOrganizationService.getOrganizedLeagues({
      season: season ?? 'current',
    });

    // Helper para procurar nos dois arrays (main e other)
    const allLeagues = [
      ...organized.mainCountries.flatMap((c) => c.leagues),
      ...organized.otherCountries.flatMap((c) => c.leagues),
    ];

    const found = allLeagues.find(
      (l) => l.apiSportsLeagueId === apiSportsLeagueId,
    );

    if (!found) {
      this.logger.warn(
        `Liga ${apiSportsLeagueId} não encontrada no mapeamento organizado.`,
      );
      return null;
    }
    if (!found.tsdbLeagueId || !found.seasonRange) {
      this.logger.warn(
        `Liga ${found.name} (ID: ${apiSportsLeagueId}) encontrada, mas sem mapeamento TSDB.`,
      );
      return null;
    }

    return {
      tsdbLeagueId: found.tsdbLeagueId,
      seasonRange: found.seasonRange,
      translatedLeague: found,
    };
  }

  // 🔄 CACHE REFRESH (SAFE)
  async refreshDiscoveryCache(league: number, next = 10) {
    const cacheKey = `discovery:league:${league}:next:${next}`;
    const cached = await this.cache.get<DiscoverFixture[]>(cacheKey);

    if (!cached) return;

    const updated = await Promise.all(
      cached.map(async (fixture) => {
        if (!fixture.sources.theSportsDb || !fixture.tsdbEventId) {
          return fixture;
        }

        try {
          const tsdbMatch = await this.tsdbEventsService.getEventById(
            fixture.tsdbEventId,
          );

          if (!tsdbMatch?.strStatus) return fixture;

          const newStatus = String(tsdbMatch.strStatus);
          const oldStatus = String(fixture.status);

          if (newStatus !== oldStatus) {
            return { ...fixture, status: newStatus };
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          this.logger.warn(`Failed to refresh ${fixture.tsdbEventId}: ${msg}`);
        }

        return fixture;
      }),
    );

    await this.cache.set(cacheKey, updated, CACHE_TTL.DISCOVERY_1_DAY);
  }
}
