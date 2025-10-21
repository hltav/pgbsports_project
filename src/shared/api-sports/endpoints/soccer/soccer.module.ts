import { Module } from '@nestjs/common';
import { SportsApiService } from '../../api/soccer/sportsApi.service';
import { SoccerService } from './services/soccer.service';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { SportsApiCachedService } from '../../api/soccer/sportsApiCached.service';
import { SoccerController } from './controllers/soccer.controller';
import { ImageProxyController } from '../imageProxi.controller';

@Module({
  imports: [HttpModule, CacheModule.register()],
  providers: [SportsApiService, SportsApiCachedService, SoccerService],
  controllers: [SoccerController, ImageProxyController],
  exports: [SoccerService],
})
export class SoccerModule {}
