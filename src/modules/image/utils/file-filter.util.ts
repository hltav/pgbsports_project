import { extname } from 'path';
import type { Request } from 'express-serve-static-core';
import { MulterFile } from './../../../libs/common/interface/multerFile.inteface';

export function avatarFileFilter(
  req: Request,
  file: MulterFile,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];

  const fileExt = extname(file.originalname).toLowerCase();

  if (!allowedMimes.includes(file.mimetype)) {
    const err = new Error('Tipo de arquivo inválido. Use JPEG, PNG ou WEBP.');
    return callback(err, false);
  }

  if (!allowedExts.includes(fileExt)) {
    const err = new Error(
      'Extensão de arquivo inválida. Use .jpg, .jpeg, .png ou .webp.',
    );
    return callback(err, false);
  }

  callback(null, true);
}
