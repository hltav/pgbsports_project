import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { CryptoModule } from './libs/crypto/crypto.module';
import { ModulesModule } from './modules/allmodule.module';
import { CompetitionsModule } from './shared/sports-radar/futebol/competitions/competitions.module';
import { ApiSportsModule } from './shared/api-sports/api-sports.module';
import { ImageModule } from './modules/image/image.module';
import { TheSportsDbModule } from './shared/thesportsdb-api/theSportsDb.module';
import { HealthModule } from './modules/health/health.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { MonitoringInterceptor } from './modules/monitoring/interceptors/monitoring.interceptor';
import { ExceptionLoggerFilter } from './modules/monitoring/filters/exception-logger.filter';
import { ResultsModule } from './shared/results/results.module';
import { FutebolFusionModule } from './shared/dataFusion/futebol/futebolFusion.module';
import { MyCacheModule } from './libs/services/cache/cache.module';

@Module({
  imports: [
    // 1. Schedule primeiro
    ScheduleModule.forRoot(),

    // 2. Config global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 3. SEU MÓDULO DE CACHE CUSTOMIZADO
    // ✅ Este é o único CacheModule que você precisa!
    MyCacheModule,

    // 4. Feature modules
    ModulesModule,
    CryptoModule,
    CompetitionsModule,
    ApiSportsModule,
    ImageModule,
    TheSportsDbModule,
    ResultsModule,
    FutebolFusionModule,
    HealthModule,
    MonitoringModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MonitoringInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionLoggerFilter,
    },
  ],
})
export class AppModule {}
