import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from './../../../libs/database/prisma';
import { TheSportsDbLiveApiService } from '../services/theSportsDbLive.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ResultsController } from '../controllers/results.controller';
import { ResultUpdaterService } from '../services/resultUpdater.service';
import { ResultSchedulerService } from '../services/resultScheduler.service';
import { TheSportsDbModule } from '../theSportsDb.module';
import { EventsModule } from './../../../modules/events/events.module';

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ScheduleModule.forRoot(),
    TheSportsDbModule,
    EventsModule,
  ],
  controllers: [ResultsController],
  providers: [
    PrismaService,
    TheSportsDbLiveApiService,
    ResultUpdaterService,
    ResultSchedulerService,
  ],
  exports: [ResultUpdaterService, ResultSchedulerService],
})
export class ResultsModule {}
