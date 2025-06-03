import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { CacheService } from '@/libs/services/cache/cache.service';
import { ApiFetcherService } from './api-fetcher.service';

@Injectable()
export class CachedApiService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly apiFetcherService: ApiFetcherService,
  ) {}

  async getOrFetchWithCache<T>(
    cacheKey: string,
    url: string,
    schema: z.ZodSchema<T>,
    ttl: number = 3600,
  ): Promise<T> {
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      try {
        return schema.parse(cached);
      } catch {
        console.warn(
          `Invalid cached data for key: ${cacheKey}, fetching fresh data...`,
        );
      }
    }

    const response = await this.apiFetcherService.fetchFromApi(url, schema);
    await this.cacheService.set(cacheKey, response, ttl);
    return response;
  }
}
