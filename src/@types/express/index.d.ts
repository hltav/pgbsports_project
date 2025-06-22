import type { File as MulterFile } from 'multer';

declare global {
  namespace Express {
    interface Multer {
      File: MulterFile;
    }
  }
}
