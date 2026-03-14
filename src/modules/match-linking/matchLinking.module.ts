import { forwardRef, Module } from '@nestjs/common';
import { ApiSportsModule } from '../../shared/api-sports/api-sports.module';
import { MatchsModule } from '../matchs/matchs.module';
import { MatchLinkingController } from './controllers/matchLinking.controller';
import { MatchLinkingCron } from './jobs/matchLinking.cron';
import { MatchLinkingService } from './services/matchLinking.service';
import { QueueModule } from './../../libs/services/queue/queue.module';
import { MatchLinkingWorker } from './workers/matchLinking.worker';
import { PrismaModule } from './../../libs/database/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MatchsModule,
    ApiSportsModule,
    forwardRef(() => QueueModule),
  ],
  providers: [MatchLinkingService, MatchLinkingCron, MatchLinkingWorker],
  controllers: [MatchLinkingController],
  exports: [MatchLinkingService, MatchLinkingCron],
})
export class MatchLinkingModule {}
