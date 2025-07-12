import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientDataService } from '../client-data.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../../../libs/common';
import { AuthenticatedRequest } from '../../auth/dto/auth.schema';
import { CreateClientDataDTO, UpdateClientDataDTO } from '../dto';
import { Request } from '../../../libs/common/interface/request.interface';
import { ImageService } from './../../image/image.service';
import { avatarFileFilter } from './../../../modules/image/utils/file-filter.util';
import { AvatarUploadedFile } from './../../../modules/image/interface/avatarUploadedFile.interface';

@Controller('client-data')
export class ClientDataController {
  constructor(
    private readonly clientDataService: ClientDataService,
    private readonly imageService: ImageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createClientDataDto: CreateClientDataDTO) {
    return this.clientDataService.createClientData(createClientDataDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async findMyData(@Req() req: AuthenticatedRequest) {
    return this.clientDataService.getMyClientData(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async findOne(@Param('id') id: string) {
    const clientData = await this.clientDataService.getClientData(+id);
    if (!clientData) {
      throw new NotFoundException(`ClientData com ID ${id} não encontrado.`);
    }
    return clientData;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() updateClientDataDto: UpdateClientDataDTO,
  ) {
    return this.clientDataService.updateClientData(+id, updateClientDataDto);
  }

  @Put(':id/image')
  @UseGuards(JwtAuthGuard)
  async updateProfileImage(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    if (req.user.id !== id) {
      throw new UnauthorizedException(
        'Você só pode atualizar sua própria imagem',
      );
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
        return this.clientDataService.updateClientImage(id, imageUrl);
      }
    }

    throw new BadRequestException('Nenhum arquivo enviado');
  }
}
