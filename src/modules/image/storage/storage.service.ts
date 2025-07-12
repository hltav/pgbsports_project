import { MulterFile } from './../../../libs/common/interface/multerFile.inteface';

export interface StorageService {
  uploadAvatar(file: MulterFile, userId: string): Promise<string>;
  deleteAvatar(filePath: string): Promise<void>;
}
