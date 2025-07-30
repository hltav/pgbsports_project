import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';
import { StorageService } from './storage.service';
import { AvatarUploadedFile } from '../interface/avatarUploadedFile.interface';
import * as fs from 'fs';
import * as path from 'path';

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

  async getUserAvatarPath(userId: string): Promise<string | null> {
    const uploadDir = path.resolve('public/uploads/avatars');
    const files = await fs.promises.readdir(uploadDir);
    const userFiles = files.filter((file) => file.startsWith(`${userId}-`));

    if (userFiles.length === 0) return null;

    let latestFile = userFiles[0];
    let latestMtime = 0;

    for (const file of userFiles) {
      const stats = await fs.promises.stat(path.join(uploadDir, file));
      if (stats.mtimeMs > latestMtime) {
        latestMtime = stats.mtimeMs;
        latestFile = file;
      }
    }

    return `https://apirtsmanager.duckdns.org/public/uploads/avatars/${latestFile}`;
  }

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
