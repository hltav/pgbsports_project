// import {
//   Body,
//   Controller,
//   Get,
//   Param,
//   Post,
//   Put,
//   Req,
//   UseGuards,
//   UsePipes,
//   ValidationPipe,
// } from '@nestjs/common';
// import { ClientDataService } from '../client-data.service';
// import { JwtAuthGuard, Roles, RolesGuard } from '../../../libs/common';
// import { AuthenticatedRequest } from '../../auth/dto/auth.schema';
// import { CreateClientDataDTO, UpdateClientDataDTO } from '../dto';
// import { Role } from '@prisma/client';

// @Controller('client-data')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(Role.USER, Role.TEST_USER)
// export class ClientDataController {
//   constructor(private readonly clientDataService: ClientDataService) {}

//   @Post()
//   @UsePipes(new ValidationPipe({ transform: true }))
//   async create(@Body() createClientDataDto: CreateClientDataDTO) {
//     return this.clientDataService.createClientData(createClientDataDto);
//   }

//   @Get()
//   async findMyData(@Req() req: AuthenticatedRequest) {
//     return this.clientDataService.getMyClientData(req.user.id);
//   }

//   @Get(':id')
//   async findOne(@Param('id') id: string) {
//     return await this.clientDataService.getClientData(+id);
//   }

//   @Put(':id')
//   @UsePipes(new ValidationPipe({ transform: true }))
//   async update(
//     @Param('id') id: string,
//     @Body() updateClientDataDto: UpdateClientDataDTO,
//   ) {
//     return this.clientDataService.updateClientData(+id, updateClientDataDto);
//   }
// }

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
import { Role } from '@prisma/client';

@Controller('client-data')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientDataController {
  constructor(private readonly clientDataService: ClientDataService) {}

  /**
   * ===============================
   * 🔹 UPSERT BASEADO NA SESSÃO
   * ===============================
   * Cria ou atualiza os dados do usuário logado.
   * O userId NUNCA vem do frontend.
   */
  @Post()
  @Roles(Role.USER, Role.TEST_USER)
  @UsePipes(new ValidationPipe({ transform: true }))
  async upsert(
    @Body() dto: CreateClientDataDTO,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;

    return this.clientDataService.upsertClientData(userId, dto);
  }

  /**
   * ===============================
   * 🔹 BUSCAR MEUS DADOS
   * ===============================
   */
  @Get('me')
  @Roles(Role.USER, Role.TEST_USER)
  async findMyData(@Req() req: AuthenticatedRequest) {
    return this.clientDataService.getMyClientData(req.user.id);
  }

  /**
   * ===============================
   * 🔹 ATUALIZAR MEUS DADOS
   * ===============================
   * Alternativa ao POST se quiser separar update.
   */
  @Put()
  @Roles(Role.USER, Role.TEST_USER)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateMyData(
    @Body() dto: UpdateClientDataDTO,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.clientDataService.updateClientDataByUser(req.user.id, dto);
  }

  /**
   * ===============================
   * 🛡 ADMIN ROUTES
   * ===============================
   * Apenas ADMIN ou SUPER_ADMIN
   */

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findOne(@Param('id') id: string) {
    return this.clientDataService.getClientData(+id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateByAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateClientDataDTO,
  ) {
    return this.clientDataService.updateClientData(+id, dto);
  }
}
