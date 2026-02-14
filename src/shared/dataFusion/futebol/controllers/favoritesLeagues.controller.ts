import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from './../../../../libs/common/interface/request.interface';
import { JwtAuthGuard, Roles, RolesGuard } from './../../../../libs';
import { ZodValidationPipe } from 'src/libs/utils/zodValidation.pipe';
import { FavoritesLeaguesService } from '../services/favoritesLeagues.service';
import {
  CreateFavoriteLeagueDto,
  CreateFavoriteLeagueDtoSchema,
  FavoriteLeagueKeyDto,
  FavoriteLeagueKeySchema,
  ListFavoriteLeaguesQuery,
  ListFavoriteLeaguesQuerySchema,
} from '../schemas/favoritesLeagues.schema';
import { UserFavoriteLeague } from '@prisma/client';

@Controller('leagues/favorites')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'USER', 'TEST_USER')
export class FavoritesLeaguesController {
  constructor(private readonly favoritesService: FavoritesLeaguesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async listFavorites(
    @Req() req: Request,
    @Query(new ZodValidationPipe(ListFavoriteLeaguesQuerySchema))
    query: ListFavoriteLeaguesQuery,
  ): Promise<UserFavoriteLeague[]> {
    return this.favoritesService.listByUser(req.user.id, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addFavorite(
    @Req() req: Request,
    @Body(new ZodValidationPipe(CreateFavoriteLeagueDtoSchema))
    dto: CreateFavoriteLeagueDto,
  ): Promise<UserFavoriteLeague> {
    return this.favoritesService.addFavorite(req.user.id, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async removeFavorite(
    @Req() req: Request,
    @Query(new ZodValidationPipe(FavoriteLeagueKeySchema))
    dto: FavoriteLeagueKeyDto,
  ): Promise<{ deleted: boolean }> {
    return this.favoritesService.removeFavorite(req.user.id, dto);
  }

  @Get('check')
  @HttpCode(HttpStatus.OK)
  async isFavorite(
    @Req() req: Request,
    @Query(new ZodValidationPipe(FavoriteLeagueKeySchema))
    dto: FavoriteLeagueKeyDto,
  ): Promise<{ isFavorite: boolean }> {
    const isFavorite = await this.favoritesService.isFavorite(req.user.id, dto);
    return { isFavorite };
  }

  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  async toggleFavorite(
    @Req() req: Request,
    @Body(new ZodValidationPipe(CreateFavoriteLeagueDtoSchema))
    dto: CreateFavoriteLeagueDto,
  ): Promise<{
    action: 'added' | 'removed';
    favorite: UserFavoriteLeague | null;
  }> {
    return this.favoritesService.toggleFavorite(req.user.id, dto);
  }
}
