import { Injectable } from '@nestjs/common';
import { TheSportsDbCachedService } from './theSportsDbCached.service';
import {
  AllLeaguesResponseSchema,
  AllLeaguesResponse,
  League,
  LookupLeagueResponseSchema,
} from '../schemas/allLeagues/allLeagues.schema';
import { CACHE_TTL } from './../../../libs/utils/cache.constants';

@Injectable()
export class TheSportsDbLeaguesService {
  constructor(private readonly cacheService: TheSportsDbCachedService) {}

  async getAllLeagues(): Promise<AllLeaguesResponse['all']> {
    const data = await this.cacheService.getWithCache<AllLeaguesResponse>(
      'all/leagues',
      undefined,
      CACHE_TTL.ONE_MONTH, // cache de 30 dias
    );

    const parsed = AllLeaguesResponseSchema.parse(data);
    return parsed.all;
  }

  async getSoccerLeagues(): Promise<AllLeaguesResponse['all']> {
    const data = await this.cacheService.getWithCache<AllLeaguesResponse>(
      'all/leagues',
      undefined,
      CACHE_TTL.ONE_MONTH,
    );

    const parsed = AllLeaguesResponseSchema.parse(data);

    // ⚽ Filtra apenas ligas de futebol
    const soccerLeagues = parsed.all.filter((league) => {
      const sport = league.strSport?.toLowerCase();
      return sport === 'soccer' || sport === 'football';
    });

    console.log(
      `⚽ Filtered ${soccerLeagues.length} soccer leagues from ${parsed.all.length} total`,
    );

    return soccerLeagues;
  }

  async getLeagueById(id: string): Promise<League | null> {
    const data = await this.cacheService.getWithCache(
      `lookup/league/${id}`,
      undefined,
      CACHE_TTL.ONE_MONTH, // cache de 30 dias
    );

    const parsed = LookupLeagueResponseSchema.parse(data);
    return parsed.lookup?.[0] ?? null;
  }
}
