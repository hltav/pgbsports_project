import { Injectable } from '@nestjs/common';
import { CacheService } from '@/libs/services/cache/cache.service';
import {
  CompetitionInfo,
  CompetitionInfoSchema,
  CompetitionsResponse,
  CompetitionsResponseSchema,
} from '../dto/competitions.dto';
import { ApiFetcherService } from '../api/api-fetcher.service';

@Injectable()
export class CompetitionsService {
  private readonly baseUrl = 'https://api.sportradar.com/soccer/trial/v4';
  private readonly apiKey = process.env.SPORTRADAR_API_KEY;
  private readonly defaultLocale = 'pt';

  constructor(
    private readonly apiFetcherService: ApiFetcherService,
    private readonly cacheService: CacheService,
  ) {}

  async getCompetitions(
    locale: string = this.defaultLocale,
  ): Promise<CompetitionsResponse> {
    const cacheKey = `sportradar:competitions:${locale}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      try {
        return CompetitionsResponseSchema.parse(cached);
      } catch {
        //return the cached data if it fails to parse
      }
    }

    const url = `${this.baseUrl}/${locale}/competitions.json?api_key=${this.apiKey}`;

    const response =
      await this.apiFetcherService.fetchFromApi<CompetitionsResponse>(
        url,
        CompetitionsResponseSchema,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

    await this.cacheService.set(cacheKey, response, 3600);
    return response;
  }

  async getCompetitionInfo(
    locale: string = this.defaultLocale,
    competitionId: string,
  ): Promise<CompetitionInfo> {
    const cacheKey = `sportradar:competition:${competitionId}:${locale}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      try {
        return CompetitionInfoSchema.parse(cached);
      } catch {
        return this.fetchAndCacheCompetitionInfo(
          cacheKey,
          locale,
          competitionId,
        );
      }
    }

    return this.fetchAndCacheCompetitionInfo(cacheKey, locale, competitionId);
  }

  private async fetchAndCacheCompetitionInfo(
    cacheKey: string,
    locale: string = this.defaultLocale,
    competitionId: string,
  ): Promise<CompetitionInfo> {
    const url = `${this.baseUrl}/${locale}/competitions/${competitionId}/info?api_key=${this.apiKey}`;

    const response = await this.apiFetcherService.fetchFromApi<CompetitionInfo>(
      url,
      CompetitionInfoSchema,
    );

    await this.cacheService.set(cacheKey, response, 3600);
    return response;
  }
}
