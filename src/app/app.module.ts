import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CryptoModule } from '@/libs/crypto/crypto.module';
import { AllmoduleModule } from '@/modules/allmodule.module';
import { LibsModule } from '@/libs/libs.module';

@Module({
  imports: [ConfigModule.forRoot(), LibsModule, AllmoduleModule, CryptoModule],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule {}
