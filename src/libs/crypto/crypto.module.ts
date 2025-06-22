import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptoService } from './services/crypto.service';
import { JwtHandlerService } from './services/jwt.service';
import { PasswordService } from './services/password.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtHandlerService, PasswordService, CryptoService],
  exports: [CryptoService, JwtHandlerService, PasswordService],
})
export class CryptoModule {}
