import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import redisStore from 'cache-manager-ioredis';
import { CacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 3600,
      max: 1000,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, CacheModule],
})
export class MyCacheModule {}
