import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from './database/src/prisma';

@Module({
  imports: [PrismaModule],
  providers: [PrismaService],
})
export class LibsModule {}
