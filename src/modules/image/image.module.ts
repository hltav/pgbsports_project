import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { LocalStorageService } from './storage/local-storage.service';
import { ClientImageController } from './image.controller';

@Module({
  controllers: [ClientImageController],
  providers: [
    ImageService,
    {
      provide: 'StorageService',
      useClass: LocalStorageService,
    },
  ],
  exports: [ImageService, 'StorageService'],
})
export class ImageModule {}
