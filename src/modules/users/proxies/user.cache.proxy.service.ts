import { Injectable } from '@nestjs/common';
import {
  AuthContext,
  UsersDeleterService,
  UsersFinderService,
  UsersUpdaterService,
} from './serviceProxies';
import { UpdateUserDTO } from './../../../libs';

@Injectable()
export class UsersServiceProxy {
  constructor(
    private readonly finderService: UsersFinderService,
    private readonly updaterService: UsersUpdaterService,
    private readonly deleterService: UsersDeleterService,
  ) {}

  /** FIND METHODS **/

  findAllUsers(currentUser: AuthContext) {
    return this.finderService.findAllUsers(currentUser);
  }

  findUserById(id: number, currentUser: AuthContext) {
    return this.finderService.findUserById(id, currentUser);
  }

  findOneByEmail(email: string, currentUser: AuthContext) {
    return this.finderService.findOneByEmail(email, currentUser);
  }

  /** UPDATE METHODS **/

  update(
    id: number,
    updateUser: Partial<UpdateUserDTO>,
    currentUser: AuthContext,
  ) {
    return this.updaterService.update(id, updateUser, currentUser);
  }

  /** DELETE METHODS **/

  delete(id: number, currentUser: AuthContext) {
    return this.deleterService.delete(id, currentUser);
  }
}
