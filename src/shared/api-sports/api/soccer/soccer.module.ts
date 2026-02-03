import { Module } from '@nestjs/common';
import { SoccerApiService } from './services/soccerApi.service';
import { SoccerService } from './services/soccer.service';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { SoccerApiCachedService } from './services/soccerApiCached.service';
import { SoccerController } from './controllers/soccer.controller';
import { ImageProxyController } from '../proxy/imageProxi.controller';
import { LeagueSeasonService } from './domain/leagueSeason.service';
import { PrismaModule } from './../../../../libs/database';

@Module({
  imports: [HttpModule, CacheModule.register(), PrismaModule],
  providers: [
    SoccerApiService,
    SoccerApiCachedService,
    SoccerService,
    LeagueSeasonService,
  ],
  controllers: [SoccerController, ImageProxyController],
  exports: [SoccerService],
})
export class SoccerModule {}
