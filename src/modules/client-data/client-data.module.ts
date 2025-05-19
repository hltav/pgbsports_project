import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from '../../libs/database/prisma';
import { ClientDataService } from './client-data.service';
import { ClientDataController } from './controllers/client-data.controller';
import { CreateClientDataService } from './services/create-client-data.service';
import { GetClientDataService } from './services/get-client-data.service';
import { UpdateClientDataService } from './services/update-client-data.service';
import { UpdateClientImageService } from './services/update-client-image.service';

@Module({
  imports: [PrismaModule],
  providers: [
    ClientDataService,
    PrismaService,
    CreateClientDataService,
    GetClientDataService,
    UpdateClientDataService,
    UpdateClientImageService,
  ],
  controllers: [ClientDataController],
  exports: [
    ClientDataService,
    CreateClientDataService,
    GetClientDataService,
    UpdateClientDataService,
    UpdateClientImageService,
  ],
})
export class ClientDataModule {}
