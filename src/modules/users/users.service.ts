import { Injectable } from '@nestjs/common';
import { GetUserDTO, UpdateUserDTO, User } from './../../libs';
import { UserWithClientData } from './../../libs';
import {
  UserDeleteService,
  UserFindService,
  UserUpdateService,
} from './services';
import { Role } from './../../libs/common/enum/role.enum';

@Injectable()
export class UsersService {
  constructor(
    private readonly userFindService: UserFindService,
    private readonly userUpdateService: UserUpdateService,
    private readonly userDeleteService: UserDeleteService,
  ) {}

  async findAllUsers(role?: Role): Promise<Partial<GetUserDTO>[]> {
    return this.userFindService.findAllUsers(role);
  }

  async findUserById(
    id: number,
    role?: Role,
  ): Promise<Partial<GetUserDTO> | null> {
    return this.userFindService.findUserById(id, role);
  }

  async findOneByEmail(email: string): Promise<UserWithClientData | null> {
    return this.userFindService.findOneByEmail(email);
  }

  async update(
    id: number,
    updateUser: Partial<UpdateUserDTO>,
  ): Promise<GetUserDTO> {
    return this.userUpdateService.update(id, updateUser);
  }

  async delete(id: number): Promise<User> {
    return this.userDeleteService.delete(id);
  }
}
