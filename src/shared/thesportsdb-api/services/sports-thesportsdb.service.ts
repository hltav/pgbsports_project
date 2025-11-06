import { Injectable } from '@nestjs/common';
import { TheSportsDbCachedService } from './theSportsDbCached.service';
import {
  AllSportsResponseSchema,
  AllSportsResponse,
} from '../schemas/allSports/allSports.schema';

@Injectable()
export class TheSportsDbSportsService {
  constructor(private readonly cacheService: TheSportsDbCachedService) {}

  async getAllSports(): Promise<AllSportsResponse['all']> {
    const data = await this.cacheService.getWithCache<AllSportsResponse>(
      'all/sports',
      undefined,
      30 * 24 * 60 * 60 * 1000, // 30 dias
    );

    const parsed = AllSportsResponseSchema.parse(data);
    return parsed.all;
  }
}
