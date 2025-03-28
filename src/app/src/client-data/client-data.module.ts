import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from '../../../libs/database/src/prisma';
import { ClientDataService } from './client-data.service';
import { ClientDataController } from './client-data.controller';

@Module({
  imports: [PrismaModule],
  providers: [ClientDataService, PrismaService],
  controllers: [ClientDataController],
  exports: [ClientDataService],
})
export class ClientDataModule {}
