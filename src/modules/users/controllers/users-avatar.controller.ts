import {
  Controller,
  Post,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from './../../../libs/common/guards/jwt-auth.guard';
import { ImageService } from './../../../modules/image/image.service';
import { Request } from './../../../libs/common/interface/request.interface';
import { AvatarUploadedFile } from './../../../modules/image/interface/avatarUploadedFile.interface';
import { avatarFileFilter } from './../../../modules/image/utils/file-filter.util';

@Controller('users')
export class UserAvatarController {
  constructor(private readonly imageService: ImageService) {}

  @Post(':id/avatar')
  @UseGuards(JwtAuthGuard)
  async uploadAvatar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    if (req.user.id !== id) {
      throw new UnauthorizedException('Denied access to the user');
    }

    const parts = req.parts();
    for await (const part of parts) {
      if (part.type === 'file') {
        const buffer = await part.toBuffer();

        const file: AvatarUploadedFile = {
          originalname: part.filename,
          buffer,
          mimetype: part.mimetype,
        };

        avatarFileFilter(file);

        const imageUrl = await this.imageService.uploadUserAvatar(
          file,
          String(id),
        );
        return { imageUrl };
      }
    }

    throw new BadRequestException('No file was uploaded');
  }
}
