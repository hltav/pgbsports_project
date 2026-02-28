/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  HttpStatus,
  HttpCode,
  Logger,
  Post,
  Delete,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { DiscoverFixture } from '../schemas/discoveryFixture.schema';
import { DiscoverLeague } from '../schemas/discoveryLeague.schema';
import { LeagueDiscoveryService } from '../services/leagueDiscovery.service';
import { SoccerDiscoveryService } from '../services/soccerDiscovery.service';
import { LeagueOrganizationService } from '../services/leagueOrganization.service';
import { ZodValidationPipe } from './../../../../libs/utils/zodValidation.pipe';
import {
  GetOrganizedLeaguesDtoSchema,
  GetOrganizedLeaguesDto,
  parseSeason,
  InvalidateCacheDtoSchema,
  InvalidateCacheDto,
} from '../schemas/organizationLeagues.schema';
import { OrganizedLeaguesResponse } from '../interfaces/organized.interface';
import { JwtAuthGuard, RolesGuard } from './../../../../libs';

@Controller('soccer/discovery')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SoccerDiscoveryController {
  private readonly logger = new Logger(SoccerDiscoveryController.name);

  constructor(
    private readonly soccerDiscoveryService: SoccerDiscoveryService,
    private readonly leagueDiscoveryService: LeagueDiscoveryService,
    private readonly leagueOrgService: LeagueOrganizationService,
  ) {}

  @Get('next-fixtures')
  @HttpCode(HttpStatus.OK)
  async getNextFixtures(
    @Query('league') league: string,
    @Query('next', new DefaultValuePipe(10), ParseIntPipe) next?: number,
    @Query('season') seasonParam?: string,
  ): Promise<DiscoverFixture[]> {
    return this.soccerDiscoveryService.discoverNextFixtures(
      parseInt(league),
      next || 10,
    );
  }

  @Get('current-season')
  @HttpCode(HttpStatus.OK)
  async getCurrentSeason(@Query('league') league: string) {
    const leagueId = parseInt(league);
    const season =
      await this.soccerDiscoveryService.getCurrentSeasonForLeague(leagueId);
    return { league: leagueId, currentSeason: season };
  }

  @Get('leagues')
  @HttpCode(HttpStatus.OK)
  async discoverLeagues(
    @Query('season') season?: string,
  ): Promise<DiscoverLeague[]> {
    return this.leagueDiscoveryService.discoverLeaguesByQuery(season);
  }

  //Ligas organizadas por país
  // Validação automática com Zod
  @Get('leagues/organized')
  async getOrganizedLeagues(
    @Query(new ZodValidationPipe(GetOrganizedLeaguesDtoSchema))
    dto: GetOrganizedLeaguesDto,
    @Query('scope') scope?: 'current' | 'all',
  ): Promise<OrganizedLeaguesResponse> {
    const season =
      scope === 'current'
        ? 'current'
        : scope === 'all'
          ? undefined
          : parseSeason(dto.season);

    return this.leagueOrgService.getOrganizedLeagues({
      season,
      forceRefresh: dto.refresh || false,
    });
  }

  // Pré-aquece o cache (admin)
  // Executa em background
  @Post('cache/warmup')
  @HttpCode(HttpStatus.ACCEPTED)
  async warmupCache() {
    await this.leagueOrgService
      .warmupCache()
      .catch((error) => this.logger.error('Warmup error:', error));

    return { message: 'Cache warmup started' };
  }

  // Invalida cache de ligas organizadas (admin)
  // Validação automática com Zod
  @Delete('cache/organized')
  @HttpCode(HttpStatus.NO_CONTENT)
  async invalidateOrganizedCache(
    @Query(new ZodValidationPipe(InvalidateCacheDtoSchema))
    dto: InvalidateCacheDto,
  ) {
    const parsedSeason = parseSeason(dto.season);

    if (parsedSeason) {
      await this.leagueOrgService.invalidateCache(parsedSeason);
    } else {
      await this.leagueOrgService.invalidateAllCache();
    }
  }
}
