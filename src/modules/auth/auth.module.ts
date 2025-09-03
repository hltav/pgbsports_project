import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { MailModule } from '../../libs/services/mailer/mail.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PrismaModule, PrismaService } from './../../libs/database/prisma';
import { UsersModule } from '../users/users.module';
import { CryptoModule } from './../../libs/crypto/crypto.module';
import { CryptoService } from './../../libs/crypto/services/crypto.service';
import {
  ConfirmEmailService,
  ForgotPasswordService,
  RefreshTokenService,
  RegisterUserService,
  SignInService,
  SignOutService,
} from './services';
import { SignInVerifyService } from './services/signInVerify.service';

@Module({
  imports: [
    CryptoModule,
    ConfigModule,
    PassportModule,
    UsersModule,
    PrismaModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    CryptoService,
    AuthService,
    RegisterUserService,
    SignInService,
    SignInVerifyService,
    SignOutService,
    ForgotPasswordService,
    RefreshTokenService,
    JwtStrategy,
    PrismaService,
    ConfirmEmailService,
  ],
  exports: [
    AuthService,
    RegisterUserService,
    SignInService,
    SignInVerifyService,
    SignOutService,
    ForgotPasswordService,
    RefreshTokenService,
  ],
})
export class AuthModule {}
