import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService, PrismaModule } from './../../libs/database/prisma';
import {
  UserDeleteService,
  UserFindService,
  UserUpdateService,
} from './services';
import { UsersServiceProxy } from './proxies/user.cache.proxy.service';
import { CacheService } from '@/libs/services/cache/cache.service';
import { MyCacheModule } from '@/libs/services/cache/cache.module';
import {
  UsersDeleterService,
  UsersFinderService,
  UsersUpdaterService,
} from './proxies/serviceProxies';

@Module({
  imports: [PrismaModule, MyCacheModule],
  providers: [
    UsersService,
    UsersServiceProxy,
    UsersDeleterService,
    UsersFinderService,
    UsersUpdaterService,
    PrismaService,
    CacheService,
    UserFindService,
    UserUpdateService,
    UserDeleteService,
  ],
  controllers: [UsersController],
  exports: [
    UsersService,
    CacheService,
    UsersServiceProxy,
    UserFindService,
    UserUpdateService,
    UserDeleteService,
    UsersDeleterService,
    UsersFinderService,
    UsersUpdaterService,
  ],
})
export class UsersModule {}
