import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LibsModule } from './libs/libs.module';
import { AllmoduleModule } from './app/allmodule.module';

@Module({
  imports: [ConfigModule.forRoot(), LibsModule, AllmoduleModule],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule {}
