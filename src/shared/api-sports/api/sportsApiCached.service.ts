import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SportsApiService } from './sportsApi.service';
import {
  HistoricalParams,
  LiveParams,
  SportsApiParams,
  TeamsParams,
  StandingsParams,
} from '../interface/serviceApiCached.interface';

@Injectable()
export class SportsApiCachedService {
  constructor(
    private readonly sportsApiService: SportsApiService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getWithCache<T>(
    endpoint: string,
    params?: SportsApiParams,
    ttl?: number,
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(endpoint, params);

    const cachedData = await this.cacheManager.get<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const liveData = await this.sportsApiService.get<T>(endpoint, params);

    const cacheTtl = this.calculateTtl(params, ttl);
    await this.cacheManager.set(cacheKey, liveData, cacheTtl);

    return liveData;
  }

  private generateCacheKey(endpoint: string, params?: SportsApiParams): string {
    const paramsString = params ? JSON.stringify(params) : '';
    return `sports-api:${endpoint}:${paramsString}`;
  }

  private calculateTtl(params?: SportsApiParams, customTtl?: number): number {
    if (customTtl) return customTtl;

    if (this.isHistoricalData(params)) {
      return 30 * 24 * 60 * 60 * 1000;
    }

    if (this.isLiveData(params)) {
      return 10 * 1000;
    }

    if (this.isTeamsParams(params)) {
      return 24 * 60 * 60 * 1000;
    }

    if (this.isStandingsParams(params)) {
      return 30 * 60 * 1000;
    }

    return 60 * 60 * 1000;
  }

  private isHistoricalData(
    params?: SportsApiParams,
  ): params is HistoricalParams {
    if (!params) return false;

    const hasHistoricalFields =
      'season' in params ||
      'date' in params ||
      'from' in params ||
      'to' in params;
    if (!hasHistoricalFields) return false;

    const currentYear = new Date().getFullYear();

    if ('season' in params && params.season && params.season < currentYear) {
      return true;
    }

    if ('date' in params && params.date && new Date(params.date) < new Date()) {
      return true;
    }

    if ('from' in params && params.from && new Date(params.from) < new Date()) {
      return true;
    }

    return false;
  }

  private isLiveData(params?: SportsApiParams): params is LiveParams {
    return params != null && 'live' in params;
  }

  private isTeamsParams(params?: SportsApiParams): params is TeamsParams {
    return params != null && 'league' in params && 'season' in params;
  }

  private isStandingsParams(
    params?: SportsApiParams,
  ): params is StandingsParams {
    return params != null && 'league' in params && 'season' in params;
  }
}
