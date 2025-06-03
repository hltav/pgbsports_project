import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CompetitionsService } from './competitions.service';
import { MyCacheModule } from '@/libs/services/cache/cache.module';
import { CompetitionsController } from '../controllers/competitions.controller';
import { CachedApiService } from '../api/api-cached.service';
import { ApiFetcherService } from '../api/api-fetcher.service';

@Module({
  imports: [HttpModule, MyCacheModule],
  providers: [CompetitionsService, ApiFetcherService, CachedApiService],
  controllers: [CompetitionsController],
  exports: [CompetitionsService, ApiFetcherService, CachedApiService],
})
export class CompetitionsModule {}
