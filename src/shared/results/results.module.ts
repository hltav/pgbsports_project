import { Global, Module } from '@nestjs/common';
import { ResultSchedulerService } from './services/resultScheduler.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from './../../libs/database';
import { EventsModule } from './../../modules';
import { ResultsController } from './controller/results.controller';
import { TheSportsDbLiveApiService } from '../thesportsdb-api/services/theSportsDbLive.service';
import { TheSportsDbModule } from '../thesportsdb-api/theSportsDb.module';
import { BetSettlementService } from './services/betSettlement.service';
import { BetSettlementOrchestratorService } from './services/betSettlementOrchestrator.service';
import { EventDataResolverService } from './services/eventDataResolver.service';
import { MatchsModule } from 'src/modules/matchs/matchs.module';
import { EarlyWinnerSchedulerService } from './services/earlyWinnerScheduler.service';
import { EarlyWinnerUpdateService } from './services/bet-settlement/orchestrator/earlyWinnerUpdater.service';
import { CancelledHandlerService } from './services/bet-settlement/orchestrator/cancelledHandler.service';
import { EventBatchProcessorService } from './services/bet-settlement/orchestrator/eventBatchProcessor.service';
import { ExternalMatchSyncService } from './services/bet-settlement/orchestrator/externalMatchSync.service';
import { SingleBetService } from './services/bet-settlement/orchestrator/singleBetProcessor.service';
import { StatsUpdateService } from './services/bet-settlement/orchestrator/statsUpdater.service';
import { UpdateAllPendingBetsService } from './services/bet-settlement/orchestrator/updateAllPendingBets.service';
import { EarlyWinnerEventsAnalyzerService } from './services/bet-settlement/orchestrator/earlyWinnerEventsAnalyzer.service';
import { CalculateARService } from './services/bet-settlement/settlement/calculate.service';
import { ValidateEventService } from './services/bet-settlement/settlement/validateEvent.service';
import { CanFinalizeBetService } from './services/bet-settlement/settlement/canFinalize.service';

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TheSportsDbModule,
    EventsModule,
    MatchsModule,
  ],
  controllers: [ResultsController],
  providers: [
    PrismaService,
    TheSportsDbLiveApiService,
    BetSettlementOrchestratorService,
    ResultSchedulerService,
    EventDataResolverService,
    BetSettlementService,
    EarlyWinnerSchedulerService,
    EarlyWinnerUpdateService,
    EarlyWinnerEventsAnalyzerService,
    CancelledHandlerService,
    EventBatchProcessorService,
    ExternalMatchSyncService,
    SingleBetService,
    StatsUpdateService,
    UpdateAllPendingBetsService,
    CalculateARService,
    ValidateEventService,
    CanFinalizeBetService,
  ],
  exports: [
    BetSettlementOrchestratorService,
    ResultSchedulerService,
    EventDataResolverService,
    BetSettlementService,
    EarlyWinnerSchedulerService,
    EarlyWinnerUpdateService,
    EarlyWinnerEventsAnalyzerService,
    CancelledHandlerService,
    EventBatchProcessorService,
    ExternalMatchSyncService,
    SingleBetService,
    StatsUpdateService,
    UpdateAllPendingBetsService,
    CalculateARService,
    ValidateEventService,
    CanFinalizeBetService,
  ],
})
export class ResultsModule {}
