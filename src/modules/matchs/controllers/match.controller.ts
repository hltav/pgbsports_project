import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { CreateMatchDTO, UpdateMatchDTO } from '../dto';
import { MatchService } from '../match.service';
import { JwtAuthGuard, RolesGuard } from './../../../libs';

@Controller('matches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  // ==================== CREATE ====================
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateMatchDTO) {
    return this.matchService.create(createDto);
  }

  // ==================== READ ====================
  @Get()
  async findAll(
    @Query('sport') sport?: string,
    @Query('league') league?: string,
    @Query('status') status?: MatchStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    return this.matchService.findAll({
      sport,
      league,
      status,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      page: page ? parseInt(page) : undefined,
      perPage: perPage ? parseInt(perPage) : undefined,
    });
  }

  @Get('api/:apiEventId')
  async findByApiEventId(@Param('apiEventId') apiEventId: string) {
    return this.matchService.findByApiEventId(apiEventId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.matchService.findOne(id);
  }

  @Get(':id/statistics')
  async getStatistics(@Param('id', ParseIntPipe) id: number) {
    return this.matchService.getStatistics(id);
  }

  // ==================== UPDATE ====================
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMatchDTO,
  ) {
    return this.matchService.update(id, updateDto);
  }

  @Put('api/:apiEventId/scores')
  async updateScores(
    @Param('apiEventId') apiEventId: string,
    @Body()
    scores: {
      homeScoreHT?: number;
      awayScoreHT?: number;
      homeScoreFT?: number;
      awayScoreFT?: number;
      status?: MatchStatus;
    },
  ) {
    return this.matchService.updateScores(apiEventId, scores);
  }

  // ==================== SYNC ====================
  @Post('api/:apiEventId/sync-error')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recordSyncError(
    @Param('apiEventId') apiEventId: string,
    @Body('error') error: string,
  ) {
    await this.matchService.recordSyncError(apiEventId, error);
  }

  @Get('needing-sync')
  async findMatchesNeedingSync(@Query('limit') limit?: string) {
    return this.matchService.findMatchesNeedingSync(
      limit ? parseInt(limit) : 50,
    );
  }
  // ==================== DELETE ====================
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.matchService.delete(id);
  }
}
