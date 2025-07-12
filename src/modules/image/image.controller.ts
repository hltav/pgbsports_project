import {
  Controller,
  Delete,
  Put,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { Request } from './../../libs/common/interface/request.interface';
import { ClientDataService } from '../client-data/client-data.service';
import { ImageService } from './image.service';
import { JwtAuthGuard } from './../../libs/common/guards/jwt-auth.guard';

@Controller('client-image')
export class ClientImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly clientDataService: ClientDataService,
  ) {}

  @Put(':id/avatar')
  @UseGuards(JwtAuthGuard)
  async updateAvatar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const user = req.user;

    if (user.id !== id) {
      throw new UnauthorizedException('Acesso negado');
    }

    const clientData = await this.clientDataService.getClientData(id);
    if (!clientData) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const parts = req.parts();
    for await (const part of parts) {
      if (part.type === 'file') {
        const buffer = await part.toBuffer();
        const file = {
          originalname: part.filename,
          buffer,
          mimetype: part.mimetype,
        };

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

    throw new NotFoundException('Nenhum arquivo enviado');
  }

  @Delete(':id/avatar')
  @UseGuards(JwtAuthGuard)
  async deleteAvatar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
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
