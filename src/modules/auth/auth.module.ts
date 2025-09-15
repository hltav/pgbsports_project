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
  ResetPasswordService,
  SignInService,
  SignOutService,
} from './services';
import { SignInVerifyService } from './services/signInVerify.service';
import { EncryptionService } from './../../libs/EncryptedData/services/encryptedData.service';
import { EncryptedDataModule } from './../../libs/EncryptedData/services/encryptedData.module';
import { EmailVerificationService } from './../../libs/services/mailer/emailVerification.service';

@Module({
  imports: [
    CryptoModule,
    ConfigModule,
    PassportModule,
    UsersModule,
    PrismaModule,
    EncryptedDataModule,
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
    EncryptionService,
    ResetPasswordService,
    EmailVerificationService,
  ],
  exports: [
    AuthService,
    RegisterUserService,
    SignInService,
    SignInVerifyService,
    SignOutService,
    ForgotPasswordService,
    RefreshTokenService,
    EncryptionService,
    ResetPasswordService,
  ],
})
export class AuthModule {}
