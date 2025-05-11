import { Module } from '@nestjs/common';
import { BankrollService } from './bankroll.service';
import { PrismaModule, PrismaService } from './../../libs/database/prisma';
import { BankrollController } from './bankroll.controller';
import { CreateBankrollService } from './services/create-bankroll.service';
import { DeleteBankrollService } from './services/delete-bankroll.service';
import { FindBankrollService } from './services/find-bankroll.service';
import { UpdateBankrollService } from './services/update-bankroll.service';

@Module({
  imports: [PrismaModule],
  providers: [
    PrismaService,
    BankrollService,
    FindBankrollService,
    CreateBankrollService,
    UpdateBankrollService,
    DeleteBankrollService,
  ],
  controllers: [BankrollController],
  exports: [
    BankrollService,
    FindBankrollService,
    CreateBankrollService,
    UpdateBankrollService,
    DeleteBankrollService,
  ],
})
export class BankrollModule {}
