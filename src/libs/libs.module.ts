import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from './database/prisma';

@Module({
  imports: [PrismaModule],
  providers: [PrismaService],
})
export class LibsModule {}
