import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from '../../../libs/database/prisma';
import { BankrollOperationService } from './services/bankrollOperation.service';
import { BankrollOperationController } from './controllers/bankrollOperation.controller';

@Module({
  imports: [PrismaModule],
  providers: [PrismaService, BankrollOperationService],
  controllers: [BankrollOperationController],
  exports: [BankrollOperationService],
})
export class BankrollOperationsModule {}
