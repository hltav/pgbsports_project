import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from './../../libs/database/prisma';
import { MatchController } from './controllers/match.controller';
import { MatchService } from './match.service';
import { SyncMatchSService } from './services/syncMatchs.service';
import { FindMatchStatsService } from './services/findMatchStats.service';
import { CreateMatchService } from './services/createMatchs.service';
import { DeleteMatchService } from './services/deleteMatchs.service';
import { FindMatchService } from './services/findMatchs.service';
import { UpdateMatchService } from './services/updateMatchs.service';
import { ApiSportsSyncService } from './services/apiSportsSynk.service';
import { SoccerModule } from './../../shared/api-sports/api/soccer/soccer.module';
import { SyncMatchDetailsService } from './services/syncMatchDetails.service';

@Module({
  imports: [PrismaModule, SoccerModule],
  controllers: [MatchController],
  providers: [
    PrismaService,
    MatchService,
    CreateMatchService,
    FindMatchService,
    UpdateMatchService,
    DeleteMatchService,
    SyncMatchSService,
    FindMatchStatsService,
    ApiSportsSyncService,
    SyncMatchDetailsService,
  ],
  exports: [
    MatchService,
    CreateMatchService,
    FindMatchService,
    UpdateMatchService,
    DeleteMatchService,
    SyncMatchSService,
    FindMatchStatsService,
    ApiSportsSyncService,
    SyncMatchDetailsService,
  ],
})
export class MatchsModule {}
