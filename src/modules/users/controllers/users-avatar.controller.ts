import {
  Controller,
  Get,
  Post,
  Delete,
  Req,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../../../libs';
import { ImageService } from '../../image/image.service';
import { ClientDataService } from '../../client-data/client-data.service';
import { Request } from '../../../libs/common/interface/request.interface';
import { AvatarUploadedFile } from '../../image/interface/avatarUploadedFile.interface';
import { avatarFileFilter } from '../../image/utils/file-filter.util';

@Controller('users-avatar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserAvatarController {
  constructor(
    private readonly imageService: ImageService,
    private readonly clientDataService: ClientDataService,
  ) {}

  // 🔹 Buscar avatar do usuário logado
  @Get()
  async getMyAvatar(@Req() req: Request) {
    const userId = req.user.id;

    const url = await this.imageService.getUserAvatarPath(String(userId));

    if (!url) {
      throw new NotFoundException('Avatar não encontrado');
    }

    return { url };
  }

  // 🔹 Upload baseado na sessão
  @Post()
  async uploadAvatar(@Req() req: Request) {
    const userId = req.user.id;

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
          String(userId),
        );

        await this.clientDataService.updateClientImage(userId, imageUrl);

        return { url: imageUrl };
      }
    }

    throw new BadRequestException('Nenhum arquivo enviado');
  }

  // 🔹 Delete baseado na sessão
  @Delete()
  async deleteAvatar(@Req() req: Request) {
    const userId = req.user.id;

    const clientData = await this.clientDataService.getMyClientData(userId);

    if (!clientData?.image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    await this.imageService.deleteUserAvatar(clientData.image);

    await this.clientDataService.updateClientImage(userId, null);

    return { message: 'Avatar removido' };
  }
}
