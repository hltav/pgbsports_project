import { Injectable, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './../../../modules/users/users.service';
import { AuthContext } from './../../../modules/users/proxies/serviceProxies/users-finders.proxy.service';

@Injectable()
export class AdminUsersService {
  constructor(private readonly usersService: UsersService) {}

  async suspendUser(userId: number, currentUser: AuthContext) {
    if (
      currentUser.role !== Role.ADMIN &&
      currentUser.role !== Role.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para suspender usuários',
      );
    }

    return this.usersService.update(userId, { isActive: false }, currentUser);
  }

  async changeRole(userId: number, role: Role, currentUser: AuthContext) {
    if (
      currentUser.role !== Role.ADMIN &&
      currentUser.role !== Role.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Você não tem permissão para alterar roles');
    }

    return this.usersService.update(userId, { role }, currentUser);
  }
}
