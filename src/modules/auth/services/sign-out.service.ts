import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class SignOutService {
  constructor(private readonly usersService: UsersService) {}

  async execute(userId: number): Promise<void> {
    const user = await this.usersService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.update(userId, { refreshToken: null });
  }
}
