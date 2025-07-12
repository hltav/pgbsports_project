import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  Param,
  ParseIntPipe,
  UploadedFile,
  Req,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MulterError } from 'multer';
import { AuthenticatedRequest } from './../../../modules/auth/dto/auth.schema';
import { ImageService } from './../../../modules/image/image.service';
import { avatarFileFilter } from './../../../modules/image/utils/file-filter.util';
import { JwtAuthGuard } from './../../../libs';
import type { Express } from 'express';

@Controller('users')
export class UserAvatarController {
  constructor(private readonly imageService: ImageService) {}

  @Post(':id/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: avatarFileFilter,
      limits: {
        fileSize: 3 * 1024 * 1024, // 3MB
      },
    }),
  )
  async uploadAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== id) {
      throw new UnauthorizedException('Denied access to the user');
    }

    try {
      const imageUrl = await this.imageService.uploadUserAvatar(
        file,
        String(id),
      );
      return { imageUrl };
    } catch (error) {
      if (error instanceof MulterError && error.code === 'LIMIT_FILE_SIZE') {
        throw new BadRequestException('Arquivo excede o limite de 3MB');
      }
      throw error;
    }
  }
}
