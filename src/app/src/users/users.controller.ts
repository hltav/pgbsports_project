import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../../libs/common/src/guards/jwt-auth.guard';
import { RolesGuard } from '../../../libs/common/src/guards/roles.guard';
import { User } from '../../../libs/common/src/interface/user.interface';
import {
  GetUserDTO,
  UpdateUserDTO,
} from '../../../libs/common/src/dto/user.dto';
import { Roles } from '../../../libs/common/src/decorator/roles.decorator';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async index(@Req() req: Request): Promise<Partial<GetUserDTO>[]> {
    const user = req.user as User; // Faz o cast para User
    const role = user?.role;
    return this.usersService.findAllUsers(role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findUserById(
    @Param('id', ParseIntPipe) id: number, // Use ParseIntPipe para garantir que 'id' seja um número
    @Req() req: Request,
  ): Promise<Partial<GetUserDTO> | null> {
    const user = req.user as User; // Faz o cast para User
    const role = user?.role;
    return this.usersService.findUserById(+id, role);
  }

  @Get('email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findOneByEmail(
    @Query('email') email: string,
  ): Promise<GetUserDTO | null> {
    return this.usersService.findOneByEmail(email);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'USER')
  async update(
    @Param('id') id: number,
    @Body() updateUser: Partial<UpdateUserDTO>,
  ): Promise<GetUserDTO> {
    const updatedUser = await this.usersService.update(Number(id), updateUser);

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'USER')
  async delete(@Param('id') id: number): Promise<User> {
    const deletedUser = await this.usersService.delete(Number(id));

    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }

    return deletedUser;
  }
}
