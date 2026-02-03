import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from '../../../libs/database/prisma';
import { BankrollGoalService } from './services/bankrollGoal.service';
import { BankrollGoalController } from './controllers/bankrollGoal.controller';

@Module({
  imports: [PrismaModule],
  providers: [PrismaService, BankrollGoalService],
  controllers: [BankrollGoalController],
  exports: [BankrollGoalService],
})
export class BankrollGoalsModule {}
