import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
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

@Controller('client-data')
export class ClientDataController {
  constructor(private readonly clientDataService: ClientDataService) {}

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
    @Param('id') id: string,
    @Body() body: { image: string },
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== +id) {
      throw new UnauthorizedException(
        'Você só pode atualizar seu próprio perfil',
      );
    }

    return this.clientDataService.updateClientImage(+id, body.image);
  }
}
