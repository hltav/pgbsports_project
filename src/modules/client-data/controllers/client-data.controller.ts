import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientDataService } from '../client-data.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../../../libs/common';
import { AuthenticatedRequest } from '../../auth/dto/auth.schema';
import { CreateClientDataDTO, UpdateClientDataDTO } from '../dto';

@Controller('client-data')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER')
export class ClientDataController {
  constructor(private readonly clientDataService: ClientDataService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createClientDataDto: CreateClientDataDTO) {
    return this.clientDataService.createClientData(createClientDataDto);
  }

  @Get()
  async findMyData(@Req() req: AuthenticatedRequest) {
    return this.clientDataService.getMyClientData(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.clientDataService.getClientData(+id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() updateClientDataDto: UpdateClientDataDTO,
  ) {
    return this.clientDataService.updateClientData(+id, updateClientDataDto);
  }
}
