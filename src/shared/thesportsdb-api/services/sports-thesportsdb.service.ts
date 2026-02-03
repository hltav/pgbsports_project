import { Injectable } from '@nestjs/common';
import { TheSportsDbCachedService } from './theSportsDbCached.service';
import {
  AllSportsResponseSchema,
  AllSportsResponse,
} from '../schemas/allSports/allSports.schema';
import { CACHE_TTL } from './../../../libs/utils/cache.constants';

@Injectable()
export class TheSportsDbSportsService {
  constructor(private readonly cacheService: TheSportsDbCachedService) {}

  async getAllSports(): Promise<AllSportsResponse['all']> {
    const data = await this.cacheService.getWithCache<AllSportsResponse>(
      'all/sports',
      undefined,
      CACHE_TTL.ONE_MONTH, // 30 dias
    );

    const parsed = AllSportsResponseSchema.parse(data);
    return parsed.all;
  }
}
