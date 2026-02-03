import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from '../../../libs/database/prisma';
import { BankrollRecordService } from './services/bankrollRecord.service';
import { BankrollRecordController } from './controllers/bankrollRecord.controller';

@Module({
  imports: [PrismaModule],
  providers: [PrismaService, BankrollRecordService],
  controllers: [BankrollRecordController],
  exports: [BankrollRecordService],
})
export class BankrollRecordsModule {}
