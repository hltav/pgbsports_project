import { AvatarUploadedFile } from '../interface/avatarUploadedFile.interface';

export interface StorageService {
  uploadAvatar(file: AvatarUploadedFile, userId: string): Promise<string>;
  deleteAvatar(filePath: string): Promise<void>;
}
