import { Module } from '@nestjs/common';
import { SportsApiService } from '../../api/sportsApi.service';
import { SoccerService } from './services/soccer.service';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { SportsApiCachedService } from '../../api/sportsApiCached.service';
import { SoccerController } from './controllers/soccer.controller';

@Module({
  imports: [HttpModule, CacheModule.register()],
  providers: [SportsApiService, SportsApiCachedService, SoccerService],
  controllers: [SoccerController],
  exports: [SoccerService],
})
export class SoccerModule {}
