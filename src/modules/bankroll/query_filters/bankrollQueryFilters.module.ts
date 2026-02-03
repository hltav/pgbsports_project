import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from '../../../libs/database/prisma';
import { BankrollFilterController } from './controllers/bankrollFilter.controller';
import { BankrollFilterService } from './services/bankrollFilter.service';
import { BankrollPaginationModule } from '../pagination/bankrollPagination.module';

@Module({
  imports: [PrismaModule, BankrollPaginationModule],
  providers: [PrismaService, BankrollFilterService],
  controllers: [BankrollFilterController],
  exports: [BankrollFilterService],
})
export class BankrollQueryFiltersModule {}
