import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService, PrismaModule } from './../../libs/database/prisma';
import {
  UserDeleteService,
  UserFindService,
  UserUpdateService,
} from './services';

@Module({
  imports: [PrismaModule],
  providers: [
    UsersService,
    PrismaService,
    UserFindService,
    UserUpdateService,
    UserDeleteService,
  ],
  controllers: [UsersController],
  exports: [
    UsersService,
    UserFindService,
    UserUpdateService,
    UserDeleteService,
  ],
})
export class UsersModule {}
