import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ProxyService {
  constructor(
    private readonly http: HttpService,
    private readonly cacheService: CacheService,
  ) {}

  async getExternalData<T>(
    url: string,
    ttl = 30 * 24 * 60 * 60 * 1000,
  ): Promise<T> {
    const cacheKey = `external:${url}`;
    const cached = await this.cacheService.get<T>(cacheKey);

    if (cached) {
      return cached;
    }

    const { data } = await firstValueFrom(this.http.get<T>(url));

    await this.cacheService.set(cacheKey, data, ttl);
    return data;
  }
}
