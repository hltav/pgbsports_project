import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PrismaModule, PrismaService } from 'src/libs/database';

@Module({
  imports: [PrismaModule],
  providers: [EventsService, PrismaService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
