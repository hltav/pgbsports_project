import { Module } from '@nestjs/common';
import { BankrollService } from './bankroll.service';
import { PrismaModule, PrismaService } from './../../libs/database/prisma';
import { BankrollController } from './bankroll.controller';

@Module({
  imports: [PrismaModule],
  providers: [BankrollService, PrismaService],
  controllers: [BankrollController],
  exports: [BankrollService],
})
export class BankrollModule {}
