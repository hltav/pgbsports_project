import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientDataService } from '../client-data.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../../../libs/common';
import { AuthenticatedRequest } from '../../auth/dto/auth.schema';
import { CreateClientDataDTO, UpdateClientDataDTO } from '../dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './../../image/image.service';
import { avatarFileFilter } from './../../../modules/image/utils/file-filter.util';
import type { Express } from 'express';

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
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 3 * 1024 * 1024 }, // até 3MB
      fileFilter: avatarFileFilter,
    }),
  )
  async updateProfileImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== +id) {
      throw new UnauthorizedException(
        'Você só pode atualizar sua própria imagem',
      );
    }

    if (!file) {
      throw new BadRequestException('Arquivo inválido ou ausente');
    }

    const imageUrl = await this.imageService.uploadUserAvatar(file, id);
    return this.clientDataService.updateClientImage(+id, imageUrl);
  }
}
