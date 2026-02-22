import { Injectable } from '@nestjs/common';
import { CacheService } from './../../../../libs/services/cache/cache.service';
import { UsersService } from './../../../../modules/users/users.service';
import { GetUserDTO, UpdateUserDTO } from './../../../../libs/common/dto/user';
import { Role } from '@prisma/client';

@Injectable()
export class UsersUpdaterService {
  constructor(
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
  ) {}

  async update(
    id: number,
    updateUser: Partial<UpdateUserDTO>,
    currentUser: { id: number; role: Role },
  ): Promise<GetUserDTO> {
    const updatedUser = await this.usersService.update(
      id,
      updateUser,
      currentUser,
    );

    try {
      await this.invalidateCache(id);
    } catch (error) {
      console.error('Cache invalidation failed', error);
    }

    return updatedUser;
  }

  private async invalidateCache(id: number) {
    const roles = ['any', 'ADMIN', 'USER', 'SUPER_ADMIN'];

    await Promise.all([
      ...roles.map((r) => this.cacheService.del(`users:id:${id}:${r}`)),
      ...roles.map((r) => this.cacheService.del(`users:all:${r}`)),
    ]);
  }
}
