import { Inject, Injectable } from '@nestjs/common';
import { StorageService } from './storage/storage.service';
import type { Request } from 'express';

@Injectable()
export class ImageService {
  constructor(
    @Inject('StorageService') private readonly storage: StorageService,
  ) {}

  async uploadUserAvatar(file: Request['file'], userId: string) {
    return this.storage.uploadAvatar(file, userId);
  }

  async deleteUserAvatar(filePath: string) {
    return this.storage.deleteAvatar(filePath);
  }
}
