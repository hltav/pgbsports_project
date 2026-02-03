import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from '../../../libs/database/prisma';
import { BankrollAlertController } from './controllers/bankrollAlert.controller';
import { BankrollAlertService } from './services/bankrollAlert.service';

@Module({
  imports: [PrismaModule],
  providers: [PrismaService, BankrollAlertService],
  controllers: [BankrollAlertController],
  exports: [BankrollAlertService],
})
export class BankrollAlertsModule {}
