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
import { ImageService } from './../../modules/image/image.service';
import { LocalStorageService } from './../../modules/image/storage/local-storage.service';
import { EncryptedDataModule } from './../../libs/EncryptedData/services/encryptedData.module';
import { EncryptionService } from './../../libs/EncryptedData/services/encryptedData.service';

@Module({
  imports: [PrismaModule, EncryptedDataModule],
  providers: [
    ClientDataService,
    PrismaService,
    CreateClientDataService,
    GetClientDataService,
    GetMyClientDataService,
    UpdateClientDataService,
    UpdateClientImageService,
    ImageService,
    {
      provide: 'StorageService',
      useClass: LocalStorageService,
    },
    EncryptionService,
  ],
  controllers: [ClientDataController],
  exports: [
    ClientDataService,
    CreateClientDataService,
    GetClientDataService,
    GetMyClientDataService,
    UpdateClientDataService,
    UpdateClientImageService,
    ImageService,
  ],
})
export class ClientDataModule {}
