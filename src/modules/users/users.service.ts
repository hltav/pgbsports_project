import { Injectable } from '@nestjs/common';
import { GetUserDTO, UpdateUserDTO, User } from './../../libs';
import { UserWithClientData } from './../../libs';
import {
  UserDeleteService,
  UserFindService,
  UserUpdateService,
} from './services';
import { AuthContext } from './proxies/serviceProxies';

@Injectable()
export class UsersService {
  constructor(
    private readonly userFindService: UserFindService,
    private readonly userUpdateService: UserUpdateService,
    private readonly userDeleteService: UserDeleteService,
  ) {}

  async findAllUsers(currentUser: AuthContext): Promise<Partial<GetUserDTO>[]> {
    return this.userFindService.findAllUsers(currentUser);
  }

  async findUserById(
    id: number,
    currentUser: AuthContext,
  ): Promise<Partial<GetUserDTO> | null> {
    return this.userFindService.findUserById(id, currentUser);
  }

  async findOneByEmail(
    email: string,
    currentUser: AuthContext,
  ): Promise<UserWithClientData | null> {
    return this.userFindService.findOneByEmail(email, currentUser);
  }

  async findOneByEmailSystem(
    email: string,
  ): Promise<UserWithClientData | null> {
    return this.userFindService.findOneByEmailSystem(email);
  }

  async update(
    id: number,
    updateUser: Partial<UpdateUserDTO>,
    currentUser: AuthContext,
  ): Promise<GetUserDTO> {
    return this.userUpdateService.update(id, updateUser, currentUser);
  }

  async delete(id: number, currentUser: AuthContext): Promise<User> {
    return this.userDeleteService.delete(id, currentUser);
  }
}
