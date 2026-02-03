import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from '../../../libs/database/prisma';
import { CreateBankrollService } from './services/create-bankroll.service';
import { DeleteBankrollService } from './services/delete-bankroll.service';
import { FindBankrollService } from './services/find-bankroll.service';
import { FindBankrollHistoryService } from './services/findBankrollHistory.service';
import { UpdateBankrollService } from './services/update-bankroll.service';
import { BankrollCoreController } from './controllers/bankrollCore.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    PrismaService,
    CreateBankrollService,
    FindBankrollService,
    FindBankrollHistoryService,
    UpdateBankrollService,
    DeleteBankrollService,
  ],
  controllers: [BankrollCoreController],
  exports: [
    CreateBankrollService,
    FindBankrollService,
    FindBankrollHistoryService,
    UpdateBankrollService,
    DeleteBankrollService,
  ],
})
export class BankrollCoreModule {}
