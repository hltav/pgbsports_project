import { Inject, Injectable } from '@nestjs/common';
import { StorageService } from './storage/storage.service';

@Injectable()
export class ImageService {
  constructor(
    @Inject('StorageService') private readonly storage: StorageService,
  ) {}

  async uploadUserAvatar(file: Express.Multer.File, userId: string) {
    return this.storage.uploadAvatar(file, userId);
  }

  async deleteUserAvatar(filePath: string) {
    return this.storage.deleteAvatar(filePath);
  }
}
