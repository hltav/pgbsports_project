import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PrismaModule, PrismaService } from './../../libs/database/prisma';
import { BankrollModule } from '../bankroll/bankroll.module';
import { CreateBetService } from './services/createBet.service';
import { GetBetService } from './services/getBet.service';
import { UpdateBetService } from './services/updateBet.service';
import { DeleteBetService } from './services/deleteBet.service';
import { MatchsModule } from '../matchs/matchs.module';

@Module({
  imports: [PrismaModule, BankrollModule, MatchsModule],
  providers: [
    EventsService,
    PrismaService,
    CreateBetService,
    GetBetService,
    UpdateBetService,
    DeleteBetService,
  ],
  controllers: [EventsController],
  exports: [
    EventsService,
    CreateBetService,
    GetBetService,
    UpdateBetService,
    DeleteBetService,
  ],
})
export class EventsModule {}
