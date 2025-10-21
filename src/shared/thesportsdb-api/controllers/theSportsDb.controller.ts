import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { TheSportsDbSportsService } from '../services/sports-thesportsdb.service';
import { TheSportsDbLeaguesService } from '../services/leagues-thesportsdb.service';
import { TheSportsDbEventsService } from '../services/events-thesportsdb.service';
import { JwtAuthGuard, RolesGuard } from './../../../libs/common/guards';
import { Roles } from './../../../libs/common/decorator';

@Controller('sportsdb')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'USER')
export class TheSportsDbController {
  constructor(
    private readonly sportsService: TheSportsDbSportsService,
    private readonly leaguesService: TheSportsDbLeaguesService,
    private readonly eventsService: TheSportsDbEventsService,
  ) {}

  @Get('sports')
  async getAllSports() {
    try {
      const sports = await this.sportsService.getAllSports();
      return { data: sports };
    } catch (err: unknown) {
      console.error('Erro ao buscar esportes:', err);
      throw new HttpException(
        'Erro ao buscar esportes da API',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  @Get('leagues')
  async getAllLeagues() {
    try {
      const leagues = await this.leaguesService.getAllLeagues();
      return { data: leagues };
    } catch (err: unknown) {
      console.error('Erro ao buscar ligas:', err);
      throw new HttpException(
        'Erro ao buscar ligas da API',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  @Get('events/:leagueId')
  async getNextEvents(@Param('leagueId') leagueId: string) {
    if (!leagueId) {
      throw new HttpException(
        'League ID é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }

    const leagueIdNumber = Number(leagueId);
    if (isNaN(leagueIdNumber)) {
      throw new HttpException('League ID inválido', HttpStatus.BAD_REQUEST);
    }

    try {
      const events =
        await this.eventsService.getNextEventsByLeague(leagueIdNumber);
      return { data: events };
    } catch (err: unknown) {
      console.error('Erro ao buscar próximos eventos:', err);
      throw new HttpException(
        'Erro ao buscar próximos eventos da liga',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
