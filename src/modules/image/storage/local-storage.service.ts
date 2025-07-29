import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';
import { StorageService } from './storage.service';
import { AvatarUploadedFile } from '../interface/avatarUploadedFile.interface';

@Injectable()
export class LocalStorageService implements StorageService {
  private readonly uploadDir = join(
    process.cwd(),
    'public',
    'uploads',
    'avatars',
  );
  private readonly allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];

  private ensureDirExists = async (): Promise<void> => {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
    }
  };

  async uploadAvatar(
    file: AvatarUploadedFile,
    userId: string,
  ): Promise<string> {
    if (!file.originalname || !file.buffer) {
      throw new Error('Invalid file');
    }

    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (!ext || !this.allowedExtensions.includes(ext)) {
      throw new Error('File type not allowed');
    }

    await this.ensureDirExists();

    const filename = `${userId}-${randomUUID()}.${ext}`;
    const fullPath = join(this.uploadDir, filename);

    await writeFile(fullPath, file.buffer);

    return `/uploads/avatars/${filename}`.replace(/\\/g, '/');
  }

  async deleteAvatar(filePath: string): Promise<void> {
    try {
      const filename = filePath.split('/uploads/avatars/')[1];
      if (!filename) return;

      const fullPath = join(this.uploadDir, filename);
      await unlink(fullPath);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error deleting file: ${error.message}`);
      } else {
        console.error('Unknown error deleting file:', error);
      }
    }
  }
}
