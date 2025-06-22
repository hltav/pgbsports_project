import { Injectable } from '@nestjs/common';
import { CacheService } from './../../../../libs/services/cache/cache.service';
import { UsersService } from './../../../../modules/users/users.service';
import { GetUserDTO, UpdateUserDTO } from './../../../../libs/common/dto/user';

@Injectable()
export class UsersUpdaterService {
  constructor(
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
  ) {}

  async update(
    id: number,
    updateUser: Partial<UpdateUserDTO>,
  ): Promise<GetUserDTO> {
    const updatedUser = await this.usersService.update(id, updateUser);

    await this.invalidateCache(id);
    return updatedUser;
  }

  private async invalidateCache(id: number) {
    await this.cacheService.del(`users:id:${id}:any`);
    await this.cacheService.del(`users:id:${id}:ADMIN`);
    await this.cacheService.del(`users:id:${id}:USER`);
    await this.cacheService.del(`users:all:any`);
    await this.cacheService.del(`users:all:ADMIN`);
    await this.cacheService.del(`users:all:USER`);
  }
}
