// // seasons.service.ts
// import { Injectable } from '@nestjs/common';
// import { CacheService } from '@/libs/services/cache/cache.service';
// import { SeasonsResponseSchema } from '../dto/seasons.dto';
// import { ApiFetcherService } from '../api/api-fetcher.service';

// @Injectable()
// export class SeasonsService {
//   private readonly baseUrl = 'https://api.sportradar.com/soccer/trial/v4';
//   private readonly apiKey = process.env.SPORTRADAR_API_KEY;
//   private readonly defaultLocale = 'pt';

//   constructor(
//     private readonly apiFetcherService: ApiFetcherService,
//     private readonly cacheService: CacheService,
//   ) {}

//   async getSeasonsByCompetition(locale: string, competitionId: string) {
//     const cacheKey = `sportradar:competition:${competitionId}:seasons:${locale}`;
//     const url = `${this.baseUrl}/${locale}/competitions/${competitionId}/seasons.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasons(locale: string = this.defaultLocale) {
//     const cacheKey = `sportradar:seasons:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url, SeasonsResponseSchema);
//   }

//   async getSeasonCompetitorPlayers(locale: string, seasonId: string) {
//     const cacheKey = `sportradar:season:${seasonId}:competitor_players:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/competitor_players.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasonCompetitors(locale: string, seasonId: string) {
//     const cacheKey = `sportradar:season:${seasonId}:competitors:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/competitors.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasonCompetitorStatistics(
//     locale: string,
//     seasonId: string,
//     competitorId: string,
//   ) {
//     const cacheKey = `sportradar:season:${seasonId}:competitor:${competitorId}:statistics:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/competitors/${competitorId}/statistics.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasonFormStandings(locale: string, seasonId: string) {
//     const cacheKey = `sportradar:season:${seasonId}:form_standings:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/form_standings.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasonInfo(locale: string, seasonId: string) {
//     const cacheKey = `sportradar:season:${seasonId}:info:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/info.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasonLeaders(locale: string, seasonId: string) {
//     const cacheKey = `sportradar:season:${seasonId}:leaders:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/leaders.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasonLineups(locale: string, seasonId: string) {
//     const cacheKey = `sportradar:season:${seasonId}:lineups:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/lineups.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasonMissingPlayers(locale: string, seasonId: string) {
//     const cacheKey = `sportradar:season:${seasonId}:missing_players:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/missing_players.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasonOverUnderStatistics(locale: string, seasonId: string) {
//     const cacheKey = `sportradar:season:${seasonId}:over_under_statistics:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/over_under_statistics.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasonPlayers(locale: string, seasonId: string) {
//     const cacheKey = `sportradar:season:${seasonId}:players:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/players.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasonProbabilities(locale: string, seasonId: string) {
//     const cacheKey = `sportradar:season:${seasonId}:probabilities:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/probabilities.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasonSchedules(locale: string, seasonId: string) {
//     const cacheKey = `sportradar:season:${seasonId}:schedules:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/schedules.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasonSimpleTeamMappings(locale: string, seasonId: string) {
//     const cacheKey = `sportradar:season:${seasonId}:simple_team_mappings:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/simple_team_mappings.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasonSimpleTournamentMappings(locale: string, seasonId: string) {
//     const cacheKey = `sportradar:season:${seasonId}:simple_tournament_mappings:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/simple_tournament_mappings.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasonStagesGroupsCupRounds(locale: string, seasonId: string) {
//     const cacheKey = `sportradar:season:${seasonId}:stages_groups_cup_rounds:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/stages_groups_cup_rounds.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasonStandings(locale: string, seasonId: string) {
//     const cacheKey = `sportradar:season:${seasonId}:standings:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/standings.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasonSummaries(locale: string, seasonId: string) {
//     const cacheKey = `sportradar:season:${seasonId}:summaries:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/summaries.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   async getSeasonTransfers(locale: string, seasonId: string) {
//     const cacheKey = `sportradar:season:${seasonId}:transfers:${locale}`;
//     const url = `${this.baseUrl}/${locale}/seasons/${seasonId}/transfers.json?api_key=${this.apiKey}`;
//     return this.fetchAndCache(cacheKey, url);
//   }

//   private async fetchAndCache<T>(
//     cacheKey: string,
//     url: string,
//     schema?: any,
//   ): Promise<any> {
//     const cached = await this.cacheService.get(cacheKey);
//     if (cached) {
//       try {
//         if (schema) {
//           return schema.parse(cached);
//         }
//         return cached;
//       } catch {
//         // Se falhar ao parsear, prossegue para fazer a requisição novamente
//       }
//     }

//     const response = await this.apiFetcherService.fetchFromApi(url, schema);
//     await this.cacheService.set(cacheKey, response, 3600); // 1 hora de cache
//     return response;
//   }
// }
