import { Injectable, ForbiddenException } from '@nestjs/common';
import { CacheService } from '../../../../libs/services/cache/cache.service';
import { GetUserDTO, UserWithClientData } from './../../../../libs';
import { UsersService } from './../../../users/users.service';
import { Role } from '@prisma/client';

export type AuthContext = {
  id: number;
  role: Role;
};

@Injectable()
export class UsersFinderService {
  private readonly cacheTTL: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
  ) {
    this.cacheTTL = Number(process.env.CACHE_TTL_SECONDS) || 3600;
  }

  // ---------------------------------------------------------
  // 🔐 FIND ALL USERS
  // ---------------------------------------------------------
  async findAllUsers(currentUser: AuthContext): Promise<Partial<GetUserDTO>[]> {
    if (currentUser.role === Role.USER) {
      throw new ForbiddenException('Usuário não pode listar todos os usuários');
    }

    const cacheKey = `users:all:${currentUser.role}`;
    const cached = await this.cacheService.get<Partial<GetUserDTO>[]>(cacheKey);

    if (cached) return cached;

    const users = await this.usersService.findAllUsers(currentUser);

    await this.cacheService.set(cacheKey, users, this.cacheTTL);

    return users;
  }

  // ---------------------------------------------------------
  // 🔐 FIND USER BY ID (contextual)
  // ---------------------------------------------------------
  async findUserById(
    id: number,
    currentUser: AuthContext,
  ): Promise<Partial<GetUserDTO> | null> {
    // Cache precisa considerar contexto
    const cacheKey =
      currentUser.role === Role.USER
        ? `users:id:${id}:USER:${currentUser.id}`
        : `users:id:${id}:${currentUser.role}`;

    const cached = await this.cacheService.get<Partial<GetUserDTO>>(cacheKey);

    if (cached) return cached;

    const user = await this.usersService.findUserById(id, currentUser);

    if (user) {
      await this.cacheService.set(cacheKey, user, this.cacheTTL);
    }

    return user;
  }

  // ---------------------------------------------------------
  // 🔐 FIND BY EMAIL (ADMIN ONLY)
  // ---------------------------------------------------------
  async findOneByEmail(
    email: string,
    currentUser: AuthContext,
  ): Promise<UserWithClientData | null> {
    if (
      currentUser.role !== Role.ADMIN &&
      currentUser.role !== Role.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Usuário não autorizado a buscar por email');
    }

    const cacheKey = `users:email:${email}:${currentUser.role}`;

    const cached = await this.cacheService.get<UserWithClientData>(cacheKey);

    if (cached) return cached;

    const user = await this.usersService.findOneByEmail(email, currentUser);

    if (user) {
      await this.cacheService.set(cacheKey, user, this.cacheTTL);
    }

    return user;
  }
}
