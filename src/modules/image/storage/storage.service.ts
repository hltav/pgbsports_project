/* eslint-disable @typescript-eslint/no-unused-vars */
import { MulterFile } from './../../../libs/common/interface/multerFile.inteface';
import type { Request } from 'express';

export interface StorageService {
  uploadAvatar(file: Request['file'], userId: string): Promise<string>;
  deleteAvatar(filePath: string): Promise<void>;
}
