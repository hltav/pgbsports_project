import { Inject, Injectable } from '@nestjs/common';
import { StorageService } from './storage/storage.service';
import { AvatarUploadedFile } from './interface/avatarUploadedFile.interface';

@Injectable()
export class ImageService {
  constructor(
    @Inject('StorageService') private readonly storage: StorageService,
  ) {}

  async getUserAvatarPath(userId: string): Promise<string | null> {
    return this.storage.getUserAvatarPath(userId);
  }

  async uploadUserAvatar(file: AvatarUploadedFile, userId: string) {
    return this.storage.uploadAvatar(file, userId);
  }

  async deleteUserAvatar(filePath: string) {
    return this.storage.deleteAvatar(filePath);
  }
}
