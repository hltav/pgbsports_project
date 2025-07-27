import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { LocalStorageService } from './storage/local-storage.service';

@Module({
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
