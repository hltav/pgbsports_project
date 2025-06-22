import { Injectable } from '@nestjs/common';
import { CacheService } from '../../../../libs/services/cache/cache.service';
import { GetUserDTO, UserWithClientData } from '@/libs/common/dto/user';
import { Role } from './../../../../libs';
import { UsersService } from './../../../users/users.service';

@Injectable()
export class UsersFinderService {
  private readonly cacheTTL: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
  ) {
    this.cacheTTL = Number(process.env.CACHE_TTL_SECONDS) || 3600;
  }

  async findAllUsers(role?: Role): Promise<Partial<GetUserDTO>[]> {
    const cacheKey = `users:all:${role ?? 'any'}`;
    const cached = await this.cacheService.get<Partial<GetUserDTO>[]>(cacheKey);
    if (cached) return cached;

    const users = await this.usersService.findAllUsers(role);
    await this.cacheService.set(cacheKey, users, this.cacheTTL);
    return users;
  }

  async findUserById(
    id: number,
    role?: Role,
  ): Promise<Partial<GetUserDTO> | null> {
    const cacheKey = `users:id:${id}:${role ?? 'any'}`;
    const cached = await this.cacheService.get<Partial<GetUserDTO>>(cacheKey);
    if (cached) return cached;

    const user = await this.usersService.findUserById(id, role);
    if (user) {
      await this.cacheService.set(cacheKey, user, this.cacheTTL);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<UserWithClientData | null> {
    const cacheKey = `users:email:${email}`;
    const cached = await this.cacheService.get<UserWithClientData>(cacheKey);
    if (cached) return cached;

    const user = await this.usersService.findOneByEmail(email);
    if (user) {
      await this.cacheService.set(cacheKey, user, this.cacheTTL);
    }
    return user;
  }
}
