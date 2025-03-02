import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../../libs/common/src/guards/jwt-auth.guard';
import { RolesGuard } from '../../../libs/common/src/guards/roles.guard';
import { User } from '../../../libs/common/src/interface/user.interface';
import {
  CreateUserDTO,
  GetUserDTO,
  UpdateUserDTO,
} from '../../../libs/common/src/dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async index(): Promise<Partial<GetUserDTO>[]> {
    return this.usersService.findAllUsers();
  }

  @Post()
  async create(@Body() createUser: CreateUserDTO): Promise<User> {
    return this.usersService.create(createUser);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUser: Partial<UpdateUserDTO>,
  ): Promise<User> {
    const updatedUser = await this.usersService.update(Number(id), updateUser);

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<User> {
    const deletedUser = await this.usersService.delete(Number(id));

    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }

    return deletedUser;
  }
}
