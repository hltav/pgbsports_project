import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from '../../libs/database/prisma';
import { ClientDataService } from './client-data.service';
import { ClientDataController } from './controllers/client-data.controller';
import {
  GetMyClientDataService,
  UpdateClientImageService,
  UpdateClientDataService,
  GetClientDataService,
  CreateClientDataService,
} from './services';

@Module({
  imports: [PrismaModule],
  providers: [
    ClientDataService,
    PrismaService,
    CreateClientDataService,
    GetClientDataService,
    GetMyClientDataService,
    UpdateClientDataService,
    UpdateClientImageService,
  ],
  controllers: [ClientDataController],
  exports: [
    ClientDataService,
    CreateClientDataService,
    GetClientDataService,
    GetMyClientDataService,
    UpdateClientDataService,
    UpdateClientImageService,
  ],
})
export class ClientDataModule {}
