import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { TheSportsDbService } from './theSportsDb.service';
import { Cache } from 'cache-manager';
import { CACHE_TTL } from './../../../libs/utils/cache.constants';

export type TsdbParams = Record<string, string | number | undefined>;

@Injectable()
export class TheSportsDbCachedService {
  private readonly logger = new Logger(TheSportsDbCachedService.name);

  constructor(
    private readonly sportsDbService: TheSportsDbService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getWithCache<T>(
    endpoint: string,
    params?: TsdbParams,
    ttls?: number,
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(endpoint, params);

    const cachedData = await this.cacheManager.get<T>(cacheKey);
    if (cachedData) return cachedData;

    const liveData = await this.sportsDbService.get<T>(endpoint, params);

    const ttl = this.resolveTtl(endpoint, ttls);

    await this.cacheManager.set(cacheKey, liveData, ttl);

    return liveData;
  }

  private generateCacheKey(endpoint: string, params?: TsdbParams): string {
    const paramsString = params ? JSON.stringify(params) : '';
    return `tsdb:${endpoint}:${paramsString}`;
  }

  private resolveTtl(endpoint: string, customTtlMs?: number): number {
    if (customTtlMs) return customTtlMs;

    if (endpoint.includes('schedule')) {
      return CACHE_TTL.API_LONG; // ex: 30 dias
    }

    return CACHE_TTL.API_SHORT; // ex: 24h
  }
}
