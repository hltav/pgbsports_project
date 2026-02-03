import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { TheSportsDbEventsService } from './services/events-thesportsdb.service';
import { TheSportsDbLeaguesService } from './services/leagues-thesportsdb.service';
import { TheSportsDbSportsService } from './services/sports-thesportsdb.service';
import { TheSportsDbCachedService } from './services/theSportsDbCached.service';
import { TheSportsDbController } from './controllers/theSportsDb.controller';
import { TheSportsDbService } from './services/theSportsDb.service';
import { PrismaModule } from './../../libs/database/prisma';
import { TheSportsDbLiveApiService } from './services/theSportsDbLive.service';
import { TSDBImageProxyController } from './images/theSportsDBImage.proxy';

@Module({
  imports: [HttpModule, CacheModule.register(), PrismaModule],
  controllers: [TheSportsDbController, TSDBImageProxyController],
  providers: [
    TheSportsDbCachedService,
    TheSportsDbSportsService,
    TheSportsDbLeaguesService,
    TheSportsDbEventsService,
    TheSportsDbService,
    TheSportsDbLiveApiService,
  ],
  exports: [
    TheSportsDbCachedService,
    TheSportsDbSportsService,
    TheSportsDbLeaguesService,
    TheSportsDbEventsService,
    TheSportsDbService,
    TheSportsDbLiveApiService,
  ],
})
export class TheSportsDbModule {}
