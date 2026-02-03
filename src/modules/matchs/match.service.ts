import { Injectable, Logger } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { CreateMatchDTO, GetMatchDTO, UpdateMatchDTO } from './dto';
import { SyncMatchSService } from './services/syncMatchs.service';
import { FindMatchStatsService } from './services/findMatchStats.service';
import { CreateMatchService } from './services/createMatchs.service';
import { DeleteMatchService } from './services/deleteMatchs.service';
import { FindMatchService } from './services/findMatchs.service';
import { UpdateMatchService } from './services/updateMatchs.service';
import { ApiSportsSyncService } from './services/apiSportsSynk.service';

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);

  constructor(
    private readonly createMatchService: CreateMatchService,
    private readonly findMatchService: FindMatchService,
    private readonly updateMatchService: UpdateMatchService,
    private readonly deleteMatchService: DeleteMatchService,
    private readonly syncMatchService: SyncMatchSService,
    private readonly findMatchStatsService: FindMatchStatsService,
    private readonly apiSportsSynk: ApiSportsSyncService,
  ) {
    this.logger.log('MatchService facade initialized');
  }

  // ==================== CREATE ====================
  async create(data: CreateMatchDTO): Promise<GetMatchDTO> {
    return this.createMatchService.create(data);
  }
  // ==================== READ/FIND ====================
  async findOne(id: number): Promise<GetMatchDTO> {
    return this.findMatchService.findOne(id);
  }

  async findByApiEventId(
    apiSportsEventId: string,
  ): Promise<GetMatchDTO | null> {
    return this.findMatchService.findByApiSportsEventId(apiSportsEventId);
  }

  async findAll(params: {
    sport?: string;
    league?: string;
    status?: MatchStatus;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    perPage?: number;
  }) {
    return this.findMatchService.findAll(params);
  }

  // ==================== UPDATE ====================
  async update(id: number, data: UpdateMatchDTO): Promise<GetMatchDTO> {
    return this.updateMatchService.update(id, data);
  }

  async updateScores(
    apiSportsEventId: string,
    scores: Partial<UpdateMatchDTO>,
  ): Promise<GetMatchDTO> {
    return this.updateMatchService.updateScores(apiSportsEventId, scores);
  }

  // ==================== DELETE ====================
  async delete(id: number): Promise<void> {
    return this.deleteMatchService.delete(id);
  }

  // ==================== SYNC ====================
  async recordSyncError(
    apiSportsEventId: string,
    error: string,
  ): Promise<void> {
    return this.syncMatchService.recordSyncError(apiSportsEventId, error);
  }

  async findMatchesNeedingSync(limit = 50): Promise<GetMatchDTO[]> {
    return this.findMatchService.findMatchesNeedingSync(limit);
  }

  // ==================== STATISTICS ====================

  async getStatistics(matchId: number) {
    return this.findMatchStatsService.getStatistics(matchId);
  }

  async syncFixtureById(apiSportsEventId: string) {
    return this.apiSportsSynk.syncFixtureById(apiSportsEventId);
  }

  async syncMultipleFixtures(apiSportsEventId: string[]) {
    return this.apiSportsSynk.syncMultipleFixtures(apiSportsEventId);
  }
}
