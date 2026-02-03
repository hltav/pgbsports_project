import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from '../../../libs/database/prisma';
import { BankrollPeriodStatsController } from './controllers/bankrollPeriodStats.controller';
import { BankrollStatsController } from './controllers/bankrollStats.controller';
import { BankrollPeriodStatsService } from './services/bankrollPeriodStates.service';
import { BankrollStatsService } from './services/bankrollStats.service';

@Module({
  imports: [PrismaModule],
  providers: [PrismaService, BankrollPeriodStatsService, BankrollStatsService],
  controllers: [BankrollPeriodStatsController, BankrollStatsController],
  exports: [BankrollPeriodStatsService, BankrollStatsService],
})
export class BankrollStatsModule {}
