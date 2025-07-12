import { Inject, Injectable } from '@nestjs/common';
import { StorageService } from './storage/storage.service';
import { MulterFile } from './../../libs/common/interface/multerFile.inteface';

@Injectable()
export class ImageService {
  constructor(
    @Inject('StorageService') private readonly storage: StorageService,
  ) {}

  async uploadUserAvatar(file: MulterFile, userId: string) {
    return this.storage.uploadAvatar(file, userId);
  }

  async deleteUserAvatar(filePath: string) {
    return this.storage.deleteAvatar(filePath);
  }
}
