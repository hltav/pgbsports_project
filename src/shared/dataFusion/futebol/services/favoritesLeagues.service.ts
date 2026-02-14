import { Injectable, Logger } from '@nestjs/common';
import { LeagueSource, UserFavoriteLeague } from '@prisma/client';
import { PrismaService } from './../../../../libs/database';
import {
  CreateFavoriteLeagueDto,
  FavoriteLeagueKeyDto,
  ListFavoriteLeaguesQuery,
} from '../schemas/favoritesLeagues.schema';

@Injectable()
export class FavoritesLeaguesService {
  private readonly logger = new Logger(FavoritesLeaguesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listByUser(
    userId: number,
    query?: ListFavoriteLeaguesQuery,
  ): Promise<UserFavoriteLeague[]> {
    const where = {
      userId,
      ...(query?.sport ? { sport: this.normalizeSport(query.sport) } : {}),
      ...(query?.source ? { source: query.source } : {}),
    };

    return await this.prisma.userFavoriteLeague.findMany({
      where,
      orderBy: [{ sport: 'asc' }, { leagueName: 'asc' }],
    });
  }

  async addFavorite(
    userId: number,
    dto: CreateFavoriteLeagueDto,
  ): Promise<UserFavoriteLeague> {
    const data = this.normalizeCreateInput(dto);

    const favorite = await this.prisma.userFavoriteLeague.upsert({
      where: {
        userId_sport_source_externalId: {
          userId,
          sport: data.sport,
          source: data.source,
          externalId: data.externalId,
        },
      },
      create: {
        userId,
        sport: data.sport,
        source: data.source,
        externalId: data.externalId,
        leagueName: data.leagueName,
        country: data.country,
        leagueLogo: data.leagueLogo ?? null,
      },
      update: {
        leagueName: data.leagueName,
        country: data.country,
        leagueLogo: data.leagueLogo ?? null,
      },
    });

    this.logger.log(
      `Favorite upserted: user=${userId}, source=${data.source}, externalId=${data.externalId}`,
    );

    return favorite;
  }

  async removeFavorite(
    userId: number,
    dto: FavoriteLeagueKeyDto,
  ): Promise<{ deleted: boolean }> {
    const key = this.normalizeKey(dto);

    const deleted = await this.prisma.userFavoriteLeague.deleteMany({
      where: {
        userId,
        sport: key.sport,
        source: key.source,
        externalId: key.externalId,
      },
    });

    return { deleted: deleted.count > 0 };
  }

  async isFavorite(
    userId: number,
    dto: FavoriteLeagueKeyDto,
  ): Promise<boolean> {
    const key = this.normalizeKey(dto);

    const favorite = await this.prisma.userFavoriteLeague.findUnique({
      where: {
        userId_sport_source_externalId: {
          userId,
          sport: key.sport,
          source: key.source,
          externalId: key.externalId,
        },
      },
    });

    return !!favorite;
  }

  async toggleFavorite(
    userId: number,
    dto: CreateFavoriteLeagueDto,
  ): Promise<{
    action: 'added' | 'removed';
    favorite: UserFavoriteLeague | null;
  }> {
    const key = this.normalizeKey(dto);

    const existing = await this.prisma.userFavoriteLeague.findUnique({
      where: {
        userId_sport_source_externalId: {
          userId,
          sport: key.sport,
          source: key.source,
          externalId: key.externalId,
        },
      },
    });

    if (existing) {
      await this.prisma.userFavoriteLeague.delete({
        where: { id: existing.id },
      });
      return { action: 'removed', favorite: null };
    }

    const favorite = await this.addFavorite(userId, dto);
    return { action: 'added', favorite };
  }

  private normalizeSport(value: string): string {
    return value.trim().toLowerCase();
  }

  private normalizeCreateInput(dto: CreateFavoriteLeagueDto): {
    sport: string;
    source: LeagueSource;
    externalId: string;
    leagueName: string;
    country: string;
    leagueLogo?: string;
  } {
    return {
      sport: this.normalizeSport(dto.sport),
      source: dto.source,
      externalId: dto.externalId.trim(),
      leagueName: dto.leagueName.trim(),
      country: dto.country.trim(),
      leagueLogo: dto.leagueLogo?.trim(),
    };
  }

  private normalizeKey(dto: FavoriteLeagueKeyDto): {
    sport: string;
    source: LeagueSource;
    externalId: string;
  } {
    return {
      sport: this.normalizeSport(dto.sport),
      source: dto.source,
      externalId: dto.externalId.trim(),
    };
  }
}
