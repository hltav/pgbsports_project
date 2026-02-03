/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { SoccerService } from './../../../../shared/api-sports/api/soccer/services/soccer.service';
import { TheSportsDbEventsService } from './../../../../shared/thesportsdb-api/services/events-thesportsdb.service';
import { SoccerDiscoveryMapper } from '../mappers/futebolDiscovery.mapper';
import { DiscoverFixture } from '../schemas/discoveryFixture.schema';
import { LookupEvent } from './../../../../shared/thesportsdb-api/schemas/allEvents/allEvents.schema';
import { ApiSportsFixture } from './../../../../shared/api-sports/api/soccer/schemas/fixtures/apiSportsFixture.scheme';
import { CacheService } from './../../../../libs/services/cache/cache.service';
import { LeagueDiscoveryService } from './leagueDiscovery.service';
import {
  areTeamsEquivalent,
  normalizeTeamName,
} from '../../helpers/nomalizeTeamName.helper';
import { CACHE_TTL } from './../../../../libs/utils/cache.constants';

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
    private readonly leagueDiscoveryService: LeagueDiscoveryService,
  ) {}

  async discoverNextFixtures(
    league: number,
    next = 10,
  ): Promise<DiscoverFixture[]> {
    // 1. Busca os fixtures
    const apiFixtures = await this.loadApiFixtures(league, next);
    if (!apiFixtures.length) return [];

    // 🎯 2. USA A SEASON DO FIXTURE (que sempre será a current)
    const season = apiFixtures[0].league.season;

    const cacheKey = `discovery:league:${league}:next:${next}:season:${season}`;

    const cached = await this.cache.get<DiscoverFixture[]>(cacheKey);
    if (cached) return cached;

    const leagueMapping = await this.getLeagueMapping(league, season);

    if (!leagueMapping) {
      const result = apiFixtures.map((f) =>
        SoccerDiscoveryMapper.fromSources(f, null),
      );
      await this.cache.set(cacheKey, result, CACHE_TTL.DISCOVERY_1_DAY);
      return result;
    }

    const context = await this.buildDiscoveryContext(
      apiFixtures,
      leagueMapping,
      season,
    );

    const fused = apiFixtures.map((fixture) => {
      const tsdbMatch = this.findMatch(fixture, context);
      return SoccerDiscoveryMapper.fromSources(fixture, tsdbMatch);
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

    const tsdbEventsByDate =
      await this.tsdbEventsService.searchEventsByDateCached(
        uniqueDates,
        mapping.tsdbLeagueId,
        mapping.seasonRange,
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
    const home = normalizeTeamName(homeOriginal);
    const away = normalizeTeamName(awayOriginal);

    // Ordem de prioridade: ALIAS > EXACT > CONTAINS > RELAXED
    return (
      events.find(
        (e) =>
          areTeamsEquivalent(e.strHomeTeam, homeOriginal) &&
          areTeamsEquivalent(e.strAwayTeam, awayOriginal),
      ) ??
      events.find((e) => this.isExactMatch(e, home, away)) ??
      events.find((e) => this.isContainsMatch(e, home, away)) ??
      events.find((e) => this.isRelaxedMatch(e, home, away)) ??
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
  ): Promise<LeagueMapping | null> {
    // 1. Chamamos o novo método que já devolve o mapeamento direto (ou null)
    const mapping = await this.leagueDiscoveryService.getLeagueMappingByApiId(
      apiSportsLeagueId,
      season,
    );

    console.log('Mapping:', mapping);
    // 2. Verificação de nulidade (Resolve o erro "'leagues' é possivelmente 'null'")
    if (!mapping) {
      return null;
    }

    // 3. Retornamos o objeto mapeado (Resolve todos os erros de unsafe-member-access)
    return {
      tsdbLeagueId: mapping.tsdbLeagueId,
      seasonRange: mapping.seasonRange,
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
