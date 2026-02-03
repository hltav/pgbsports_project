import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from '../../../libs/database/prisma';
import { BankrollStreakService } from './services/bankrollStreak.service';
import { BankrollStreakController } from './controllers/bankrollStreaks.controller';

@Module({
  imports: [PrismaModule],
  providers: [PrismaService, BankrollStreakService],
  controllers: [BankrollStreakController],
  exports: [BankrollStreakService],
})
export class BankrollStreakModule {}
