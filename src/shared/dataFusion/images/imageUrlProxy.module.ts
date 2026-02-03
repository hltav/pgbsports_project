import { Module } from '@nestjs/common';
import { PrismaModule } from './../../../libs/database';
import { ImageUrlProxyController } from './imageUrlProxy.controller';
import { ImageUrlProxyService } from './imageUrlProxy.service';

@Module({
  imports: [PrismaModule],
  providers: [ImageUrlProxyService],
  controllers: [ImageUrlProxyController],
  exports: [ImageUrlProxyService],
})
export class ImageUrlProxyModule {}
