import { ClientDataService } from './../../modules/client-data/client-data.service';
import { ImageService } from './image.service';
import { AuthenticatedRequest } from './../../modules/auth/dto/auth.schema';
import {
  Controller,
  UseGuards,
  UseInterceptors,
  Param,
  ParseIntPipe,
  UploadedFile,
  Req,
  UnauthorizedException,
  Put,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'dist/libs';
import { avatarFileFilter } from './utils/file-filter.util';

@Controller('client-data')
export class ClientImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly clientDataService: ClientDataService,
  ) {}

  @Put(':id/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { fileFilter: avatarFileFilter }))
  async updateAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== id) {
      throw new UnauthorizedException('Acesso negado');
    }

    const clientData = await this.clientDataService.getClientData(id);
    if (!clientData) {
      throw new NotFoundException('Cliente não encontrado');
    }

    if (clientData.image) {
      await this.imageService.deleteUserAvatar(clientData.image);
    }

    const imageUrl = await this.imageService.uploadUserAvatar(file, String(id));
    return this.clientDataService.updateClientImage(id, imageUrl);
  }

  @Delete(':id/avatar')
  @UseGuards(JwtAuthGuard)
  async deleteAvatar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== id) {
      throw new UnauthorizedException('Acesso negado');
    }

    const clientData = await this.clientDataService.getClientData(id);
    if (!clientData?.image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    await this.imageService.deleteUserAvatar(clientData.image);
    return this.clientDataService.updateClientImage(id, '');
  }
}
