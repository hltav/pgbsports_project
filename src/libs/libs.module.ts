import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from './database';
import { MailModule, MailService } from './services';

@Module({
  imports: [PrismaModule, MailModule],
  providers: [PrismaService, MailService],
})
export class LibsModule {}
