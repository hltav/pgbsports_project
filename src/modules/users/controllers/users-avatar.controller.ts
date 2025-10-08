// import {
//   Controller,
//   Post,
//   Param,
//   Req,
//   UseGuards,
//   UnauthorizedException,
//   BadRequestException,
//   ParseIntPipe,
//   NotFoundException,
//   Get,
// } from '@nestjs/common';
// import { JwtAuthGuard } from './../../../libs/common/guards/jwt-auth.guard';
// import { ImageService } from './../../../modules/image/image.service';
// import { Request } from './../../../libs/common/interface/request.interface';
// import { AvatarUploadedFile } from './../../../modules/image/interface/avatarUploadedFile.interface';
// import { avatarFileFilter } from './../../../modules/image/utils/file-filter.util';
// import { Public } from './../../../libs/common/decorator/public.decorator';

// @Controller('users-avatar')
// export class UserAvatarController {
//   constructor(private readonly imageService: ImageService) {}

//   @Get(':id/avatar')
//   @Public()
//   async getAvatar(@Param('id') id: string) {
//     const url = await this.imageService.getUserAvatarPath(id);
//     if (!url) {
//       throw new NotFoundException('Avatar not found');
//     }
//     return { url };
//   }

//   @Post(':id/avatar')
//   @UseGuards(JwtAuthGuard)
//   async uploadAvatar(
//     @Param('id', ParseIntPipe) id: number,
//     @Req() req: Request,
//   ) {
//     if (req.user.id !== id) {
//       throw new UnauthorizedException('Denied access to the user');
//     }

//     const parts = req.parts();
//     for await (const part of parts) {
//       if (part.type === 'file') {
//         const buffer = await part.toBuffer();

//         const file: AvatarUploadedFile = {
//           originalname: part.filename,
//           buffer,
//           mimetype: part.mimetype,
//         };

//         avatarFileFilter(file);

//         const imageUrl = await this.imageService.uploadUserAvatar(
//           file,
//           String(id),
//         );
//         return { imageUrl };
//       }
//     }

//     throw new BadRequestException('No file was uploaded');
//   }
// }

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from './../../../libs/common/guards/jwt-auth.guard';
import { ImageService } from './../../../modules/image/image.service';
import { ClientDataService } from './../../../modules/client-data/client-data.service';
import { Request } from './../../../libs/common/interface/request.interface';
import { AvatarUploadedFile } from './../../../modules/image/interface/avatarUploadedFile.interface';
import { avatarFileFilter } from './../../../modules/image/utils/file-filter.util';
import { Public } from './../../../libs/common/decorator/public.decorator';
import { RolesGuard } from './../../../libs/common/guards/roles.guard';
import { Roles } from './../../../libs/common/decorator/roles.decorator';

@Controller('users-avatar')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'USER')
export class UserAvatarController {
  constructor(
    private readonly imageService: ImageService,
    private readonly clientDataService: ClientDataService,
  ) {}

  @Get(':id/avatar')
  @Public()
  async getAvatar(@Param('id') id: string) {
    const url = await this.imageService.getUserAvatarPath(id);
    if (!url) {
      throw new NotFoundException('Avatar not found');
    }
    return { url };
  }

  @Post(':id/avatar')
  @UseGuards(JwtAuthGuard)
  async uploadOrUpdateAvatar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    if (req.user.id !== id) {
      throw new UnauthorizedException('Denied access to the user');
    }

    const clientData = await this.clientDataService.getClientData(id);
    if (!clientData) {
      throw new NotFoundException('Client not found');
    }

    const parts = req.parts();
    let fileProcessed = false;

    for await (const part of parts) {
      if (part.type === 'file') {
        if (fileProcessed) {
          throw new BadRequestException('Somente um arquivo é permitido');
        }
        fileProcessed = true;

        const buffer = await part.toBuffer();
        const file: AvatarUploadedFile = {
          originalname: part.filename,
          buffer,
          mimetype: part.mimetype,
        };

        avatarFileFilter(file);

        if (clientData.image) {
          await this.imageService.deleteUserAvatar(clientData.image);
        }

        const imageUrl = await this.imageService.uploadUserAvatar(
          file,
          String(id),
        );

        return this.clientDataService.updateClientImage(id, imageUrl);
      }
    }

    throw new BadRequestException('No file was uploaded');
  }

  @Delete(':id/avatar')
  @UseGuards(JwtAuthGuard)
  async deleteAvatar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    if (req.user.id !== id) {
      throw new UnauthorizedException('Denied access to the user');
    }

    const clientData = await this.clientDataService.getClientData(id);
    if (!clientData?.image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    await this.imageService.deleteUserAvatar(clientData.image);
    return this.clientDataService.updateClientImage(id, '');
  }
}
