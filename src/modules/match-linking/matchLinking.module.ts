import { Module } from '@nestjs/common';
import { ApiSportsModule } from '../../shared/api-sports/api-sports.module';
import { MatchsModule } from '../matchs/matchs.module';
import { MatchLinkingController } from './controllers/matchLinking.controller';
import { MatchLinkingCron } from './jobs/matchLinking.cron';
import { MatchLinkingService } from './services/matchLinking.service';

@Module({
  imports: [MatchsModule, ApiSportsModule],
  providers: [MatchLinkingService, MatchLinkingCron],
  controllers: [MatchLinkingController],
  exports: [MatchLinkingService],
})
export class MatchLinkingModule {}
