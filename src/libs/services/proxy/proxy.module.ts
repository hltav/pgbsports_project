import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProxyService } from './proxy.service';
import { MyCacheModule } from '../cache/cache.module';

@Module({
  imports: [HttpModule, MyCacheModule],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule {}
