import { Module } from '@nestjs/common';
import { ApiSportsModule } from './../../../shared/api-sports/api-sports.module';
import { TheSportsDbModule } from './../../../shared/thesportsdb-api/theSportsDb.module';
import { FutebolFusionService } from './services/futebolFusion.service';
import { FutebolFusionController } from './controllers/futebolFusion.controller';
import { PrismaModule } from './../../../libs/database';
import { SoccerDiscoveryController } from './controllers/discovery.controller';
import { LeagueDiscoveryService } from './services/leagueDiscovery.service';
import { SoccerDiscoveryService } from './services/soccerDiscovery.service';
import { MyCacheModule } from './../../../libs/services/cache/cache.module';
import { ImageUrlProxyModule } from '../images/imageUrlProxy.module';
import { LeagueOrganizationService } from './services/leagueOrganization.service';

@Module({
  imports: [
    ApiSportsModule,
    TheSportsDbModule,
    PrismaModule,
    MyCacheModule,
    ImageUrlProxyModule,
  ],
  providers: [
    FutebolFusionService,
    SoccerDiscoveryService,
    LeagueDiscoveryService,
    LeagueOrganizationService,
  ],
  controllers: [FutebolFusionController, SoccerDiscoveryController],

  exports: [
    FutebolFusionService,
    SoccerDiscoveryService,
    LeagueDiscoveryService,
    LeagueOrganizationService,
  ],
})
export class FutebolFusionModule {}
