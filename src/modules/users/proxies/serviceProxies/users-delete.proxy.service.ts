import { Injectable } from '@nestjs/common';
import { CacheService } from '@/libs/services/cache/cache.service';
import { UsersService } from '@modules/index';
import { User } from '@/libs/common/dto/user';

@Injectable()
export class UsersDeleterService {
  constructor(
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
  ) {}

  async delete(id: number): Promise<User> {
    const deletedUser = await this.usersService.delete(id);
    await this.invalidateCache(id);
    return deletedUser;
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
