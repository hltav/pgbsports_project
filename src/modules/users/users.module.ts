import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService, PrismaModule } from './../../libs/database/prisma';
import { UsersServiceProxy } from './proxies/user.cache.proxy.service';
import { CacheService } from './../../libs/services/cache/cache.service';
import { MyCacheModule } from './../../libs/services/cache/cache.module';
import { UserAvatarController } from './controllers/users-avatar.controller';
import { ImageService } from './../../modules/image/image.service';
import { ClientDataService } from './../../modules/client-data/client-data.service';
import { ImageModule } from './../../modules/image/image.module';
import { ClientDataModule } from './../../modules/client-data/client-data.module';
import {
  UserDeleteService,
  UserFindService,
  UserUpdateService,
} from './services';
import {
  UsersDeleterService,
  UsersFinderService,
  UsersUpdaterService,
} from './proxies/serviceProxies';
import { EncryptedDataModule } from './../../libs/EncryptedData/services/encryptedData.module';

@Module({
  imports: [
    PrismaModule,
    MyCacheModule,
    ImageModule,
    ClientDataModule,
    EncryptedDataModule,
  ],
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
    ImageService,
    ClientDataService,
  ],
  controllers: [UsersController, UserAvatarController],
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
