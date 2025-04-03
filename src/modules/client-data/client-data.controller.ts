import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientDataService } from './client-data.service';
import {
  CreateClientDataDto,
  JwtAuthGuard,
  Roles,
  RolesGuard,
  UpdateClientDataDto,
} from './../../libs/common';

@Controller('client-data')
export class ClientDataController {
  constructor(private readonly clientDataService: ClientDataService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createClientDataDto: CreateClientDataDto) {
    return this.clientDataService.createClientData(createClientDataDto);
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
    @Body() updateClientDataDto: UpdateClientDataDto,
  ) {
    return this.clientDataService.updateClientData(+id, updateClientDataDto);
  }
}
