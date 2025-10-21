import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from '../cache/cache.service';
import { ProxyService } from './proxy.service';

@Module({
  imports: [HttpModule, CacheModule.register()],
  providers: [ProxyService, CacheService],
  exports: [ProxyService],
})
export class ProxyModule {}
