import { Injectable } from '@nestjs/common';
import { CacheService } from './../../../../libs/services/cache/cache.service';
import { User } from './../../../../libs/common/dto/user';
import { UsersService } from './../../../../modules/users/users.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersDeleterService {
  constructor(
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
  ) {}

  async delete(
    id: number,
    currentUser: { id: number; role: Role },
  ): Promise<User> {
    const deletedUser = await this.usersService.delete(id, currentUser);

    try {
      await this.invalidateCache(id);
    } catch (error) {
      console.error('Cache invalidation failed:', error);
    }

    return deletedUser;
  }

  private async invalidateCache(id: number) {
    const roles = ['any', 'ADMIN', 'USER', 'SUPER_ADMIN'];

    await Promise.all([
      ...roles.map((r) => this.cacheService.del(`users:id:${id}:${r}`)),
      ...roles.map((r) => this.cacheService.del(`users:all:${r}`)),
    ]);
  }
}
