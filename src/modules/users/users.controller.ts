import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './../../libs/common/guards/jwt-auth.guard';
import { RolesGuard } from './../../libs/common/guards/roles.guard';
import { GetUserDTO, UpdateUserDTO, User } from './../../libs/common/dto/user';
import { Roles } from './../../libs/common/decorator/roles.decorator';
import { Request } from './../../libs/common/interface/request.interface';
import { UsersServiceProxy } from './proxies/user.cache.proxy.service';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersServiceProxy) {}

  // ❌ USER NÃO pode listar todos
  @Get('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async index(@Req() req: Request): Promise<Partial<GetUserDTO>[]> {
    const currentUser = req.user;

    return this.usersService.findAllUsers({
      id: currentUser.id,
      role: currentUser.role,
    });
  }

  // ✅ USER pode buscar a si mesmo (regra contextual no service)
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.USER)
  async findUserById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<Partial<GetUserDTO> | null> {
    const currentUser = req.user;

    return this.usersService.findUserById(id, {
      id: currentUser.id,
      role: currentUser.role,
    });
  }

  // ❌ USER NÃO pode buscar por email
  @Get('email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async findOneByEmail(
    @Query('email') email: string,
    @Req() req: Request,
  ): Promise<GetUserDTO | null> {
    const currentUser = req.user;

    return this.usersService.findOneByEmail(email, {
      id: currentUser.id,
      role: currentUser.role,
    });
  }

  // ✅ USER pode atualizar a si mesmo
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.USER)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUser: Partial<UpdateUserDTO>,
    @Req() req: Request,
  ): Promise<GetUserDTO> {
    const currentUser = req.user;

    return this.usersService.update(id, updateUser, {
      id: currentUser.id,
      role: currentUser.role,
    });
  }

  // ⚙️ Opcional: permitir USER deletar a própria conta
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<User> {
    const currentUser = req.user;

    return this.usersService.delete(id, {
      id: currentUser.id,
      role: currentUser.role,
    });
  }
}
