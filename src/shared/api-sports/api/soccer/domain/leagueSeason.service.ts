import { Injectable } from '@nestjs/common';
import { SoccerApiCachedService } from '../services/soccerApiCached.service';
import { LeaguesResponse } from '../schemas/leagues/leagues.schema';
import { resolveLeagueSeason } from './leagueSeason.resolver';
import { CACHE_TTL } from './../../../../../libs/utils/cache.constants';

@Injectable()
export class LeagueSeasonService {
  constructor(
    private readonly soccerApiCachedService: SoccerApiCachedService,
  ) {}

  async getCurrentSeasonForLeague(leagueId: number): Promise<number> {
    const response =
      await this.soccerApiCachedService.getWithCache<LeaguesResponse>(
        '/leagues',
        { id: leagueId },
        CACHE_TTL.ONE_DAY, // 24h
      );

    const league = response.response[0];
    if (!league) {
      throw new Error(`League ${leagueId} not found`);
    }

    return resolveLeagueSeason(league.seasons);
  }
}
