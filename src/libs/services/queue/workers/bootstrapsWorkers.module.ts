import { forwardRef, Module } from '@nestjs/common';
import { WorkerBootstrapService } from './bootstrapWorkers.service';
import { BankrollModule } from './../../../../modules';
import { QueueModule } from '../queue.module';
import { MatchLinkingModule } from './../../../../modules/match-linking/matchLinking.module';
import { ResultsModule } from './../../../../shared/results/results.module';
import { MatchsModule } from './../../../../modules/matchs/matchs.module';

@Module({
  imports: [
    QueueModule,
    forwardRef(() => BankrollModule),
    MatchLinkingModule,
    ResultsModule,
    MatchsModule,
  ],
  providers: [WorkerBootstrapService],
})
export class WorkerBootstrapModule {}
