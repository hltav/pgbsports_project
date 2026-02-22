import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { AuthContext } from './../../../modules/users/proxies/serviceProxies/users-finders.proxy.service';

@Injectable()
export class SignOutService {
  constructor(private readonly usersService: UsersService) {}

  async execute(userId: number, currentUser: AuthContext): Promise<void> {
    const authenticatedCaller: AuthContext = {
      id: currentUser.id,
      role: currentUser.role,
    };

    const user = await this.usersService.findUserById(
      userId,
      authenticatedCaller,
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.update(
      userId,
      { refreshToken: null },
      authenticatedCaller,
    );
  }
}
