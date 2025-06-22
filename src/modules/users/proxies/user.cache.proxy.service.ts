import { Injectable } from '@nestjs/common';
import {
  UsersDeleterService,
  UsersFinderService,
  UsersUpdaterService,
} from './serviceProxies';
import { UpdateUserDTO } from './../../../libs';
import { Role } from './../../../libs';

@Injectable()
export class UsersServiceProxy {
  constructor(
    private readonly finderService: UsersFinderService,
    private readonly updaterService: UsersUpdaterService,
    private readonly deleterService: UsersDeleterService,
  ) {}

  /** FIND METHODS **/

  findAllUsers(role?: Role) {
    return this.finderService.findAllUsers(role);
  }

  findUserById(id: number, role?: Role) {
    return this.finderService.findUserById(id, role);
  }

  findOneByEmail(email: string) {
    return this.finderService.findOneByEmail(email);
  }

  /** UPDATE METHODS **/

  update(id: number, updateUser: Partial<UpdateUserDTO>) {
    return this.updaterService.update(id, updateUser);
  }

  /** DELETE METHODS **/

  delete(id: number) {
    return this.deleterService.delete(id);
  }
}
