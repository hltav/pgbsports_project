import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from './../../../libs/database/prisma';
import { TheSportsDbLiveApiService } from '../services/theSportsDbLive.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ResultsController } from '../controllers/results.controller';
import { ResultUpdaterService } from '../services/resultUpdater.service';
import { ResultSchedulerService } from '../services/resultScheduler.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [ResultsController],
  providers: [
    PrismaService,
    TheSportsDbLiveApiService,
    ResultUpdaterService,
    ResultSchedulerService,
  ],
  exports: [ResultUpdaterService],
})
export class ResultsModule {}
