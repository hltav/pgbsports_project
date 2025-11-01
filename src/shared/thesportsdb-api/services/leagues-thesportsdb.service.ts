import { Injectable } from '@nestjs/common';
import { TheSportsDbCachedService } from './theSportsDbCached.service';
import {
  AllLeaguesResponseSchema,
  AllLeaguesResponse,
  League,
  LookupLeagueResponseSchema,
} from '../schemas/allLeagues/allLeagues.schema';

@Injectable()
export class TheSportsDbLeaguesService {
  constructor(private readonly cacheService: TheSportsDbCachedService) {}

  async getAllLeagues(): Promise<AllLeaguesResponse['all']> {
    // TTL de 6h (ligas podem mudar um pouco mais frequentemente)
    const data = await this.cacheService.getWithCache<AllLeaguesResponse>(
      'all/leagues',
      undefined,
      3 * 60 * 60 * 1000,
    );

    const parsed = AllLeaguesResponseSchema.parse(data);
    return parsed.all;
  }

  async getLeagueById(id: string): Promise<League | null> {
    const data = await this.cacheService.getWithCache(
      `lookup/league/${id}`,
      undefined,
      3 * 60 * 60 * 1000,
    );

    const parsed = LookupLeagueResponseSchema.parse(data);
    return parsed.lookup?.[0] ?? null;
  }
}
