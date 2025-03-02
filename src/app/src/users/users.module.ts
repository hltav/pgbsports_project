import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../../libs/database/src/prisma/prisma.service';
import { PrismaModule } from '../../../libs/database/src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, PrismaService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
