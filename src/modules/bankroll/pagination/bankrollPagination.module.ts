import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from '../../../libs/database/prisma';
import { BankrollPaginationService } from './services/bankrollPagination.service';

@Module({
  imports: [PrismaModule],
  providers: [PrismaService, BankrollPaginationService],
  controllers: [],
  exports: [BankrollPaginationService],
})
export class BankrollPaginationModule {}
