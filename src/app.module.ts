import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CryptoModule } from './libs/crypto/crypto.module';
import { AllmoduleModule } from './modules/allmodule.module';
import { LibsModule } from './libs/libs.module';
import { CompetitionsModule } from './shared/sports-radar/futebol/competitions/competitions.module';
import { ApiSportsModule } from './shared/api-sports/api-sports.module';
import { ImageModule } from './modules/image/image.module';
import { CacheModule } from '@nestjs/cache-manager';
import redisStore from 'cache-manager-ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST');
        const redisPort = configService.get<number>('REDIS_PORT');
        const redisPassword = configService.get<string>('REDIS_PASSWORD');
        const redisDb = configService.get<number>('REDIS_DB') || 0;

        if (!redisHost || !redisPort) {
          throw new Error('Redis environment variables are not defined');
        }

        return {
          store: redisStore,
          host: redisHost,
          port: redisPort,
          auth_pass: redisPassword,
          db: redisDb,
          ttl: 60 * 60,
        };
      },
    }),
    LibsModule,
    AllmoduleModule,
    CryptoModule,
    CompetitionsModule,
    ApiSportsModule,
    ImageModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule {}
