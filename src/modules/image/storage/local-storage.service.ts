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
  private readonly baseUrl = process.env.API_URL ?? 'http://localhost:3000';
  private readonly allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  private readonly allowedMimeTypes = [
    'image/jpg',
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  private ensureDirExists = async (): Promise<void> => {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
    }
  };

  async getUserAvatarPath(userId: string): Promise<string | null> {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');

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

    return `${this.baseUrl}/uploads/avatars/${latestFile}`;
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
      throw new Error('File type not allowed (extension)');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('File type not allowed (mimetype)');
    }

    await this.ensureDirExists();

    const filename = `${userId}-${randomUUID()}.${ext}`;
    const fullPath = join(this.uploadDir, filename);

    await writeFile(fullPath, file.buffer);

    return `${process.env.API_URL}/uploads/avatars/${filename}`.replace(
      /\\/g,
      '/',
    );
  }

  async deleteAvatar(filePath: string): Promise<void> {
    const filename = filePath.split('/uploads/avatars/')[1];
    if (!filename) return;

    const fullPath = join(this.uploadDir, filename);

    try {
      await unlink(fullPath);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error deleting file: ${error.message}`);
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code !== 'ENOENT'
      ) {
        console.error(
          `Error deleting file: ${(error as { code?: string }).code}`,
        );
      }
    }
  }
}
