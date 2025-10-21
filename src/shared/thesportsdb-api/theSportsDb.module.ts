import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { TheSportsDbEventsService } from './services/events-thesportsdb.service';
import { TheSportsDbLeaguesService } from './services/leagues-thesportsdb.service';
import { TheSportsDbSportsService } from './services/sports-thesportsdb.service';
import { TheSportsDbCachedService } from './services/theSportsDbCached.service';
import { TheSportsDbController } from './controllers/theSportsDb.controller';
import { TheSportsDbService } from './services/theSportsDb.service';

@Module({
  imports: [HttpModule, CacheModule.register()],
  controllers: [TheSportsDbController],
  providers: [
    TheSportsDbCachedService,
    TheSportsDbSportsService,
    TheSportsDbLeaguesService,
    TheSportsDbEventsService,
    TheSportsDbService,
  ],
  exports: [
    TheSportsDbCachedService,
    TheSportsDbSportsService,
    TheSportsDbLeaguesService,
    TheSportsDbEventsService,
    TheSportsDbService,
  ],
})
export class TheSportsDbModule {}
