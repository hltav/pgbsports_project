import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { LocalStorageService } from './storage/local-storage.service';
import { ClientImageController } from './image.controller';
import { ClientDataService } from '../client-data/client-data.service';
import {
  CreateClientDataService,
  GetMyClientDataService,
  GetClientDataService,
  UpdateClientDataService,
  UpdateClientImageService,
} from '../client-data/services';
import { PrismaModule } from './../../libs/database/prisma/prisma.module';
import { EncryptedDataModule } from './../../libs/EncryptedData/services/encryptedData.module';

@Module({
  imports: [PrismaModule, EncryptedDataModule],
  controllers: [ClientImageController],
  providers: [
    ImageService,
    {
      provide: 'StorageService',
      useClass: LocalStorageService,
    },
    ClientDataService,
    CreateClientDataService,
    GetMyClientDataService,
    GetClientDataService,
    UpdateClientDataService,
    UpdateClientImageService,
  ],
  exports: [ClientDataService, ImageService, 'StorageService'],
})
export class ImageModule {}
