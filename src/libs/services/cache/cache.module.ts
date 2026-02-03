import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache.service';
import { CacheTestController } from './testeConecction/cacheTest.controller';

@Module({
  imports: [
    ConfigModule,
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl =
          configService.get<string>('REDIS_PUBLIC_URL') ||
          configService.get<string>('REDIS_URL') ||
          'redis://localhost:6379';

        return {
          store: redisStore,
          url: redisUrl,
          ttl: 3600,
        };
      },
    }),
  ],
  providers: [CacheService],
  controllers: [CacheTestController],
  exports: [CacheService, NestCacheModule],
})
export class MyCacheModule {}
