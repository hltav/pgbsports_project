import type { Express } from 'express';
export interface StorageService {
  uploadAvatar(file: Express.Multer.File, userId: string): Promise<string>;
  deleteAvatar(filePath: string): Promise<void>;
}
