import { extname } from 'path';
import { AvatarUploadedFile } from '../interface/avatarUploadedFile.interface';
import { BadRequestException } from '@nestjs/common';

export function avatarFileFilter(file: AvatarUploadedFile): void {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];

  const fileExt = extname(file.originalname).toLowerCase();

  if (!allowedMimes.includes(file.mimetype)) {
    throw new BadRequestException(
      'Tipo de arquivo inválido. Use JPEG, PNG ou WEBP.',
    );
  }

  if (!allowedExts.includes(fileExt)) {
    throw new BadRequestException(
      'Extensão de arquivo inválida. Use .jpg, .jpeg, .png ou .webp.',
    );
  }
}
