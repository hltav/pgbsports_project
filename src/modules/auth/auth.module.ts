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
import { ForgotPasswordService } from './services/forgot-password.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { RegisterUserService } from './services/register-user.service';
import { SignInService } from './services/sign-in.service';
import { SignOutService } from './services/sign-out.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
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
    AuthService,
    RegisterUserService,
    SignInService,
    SignOutService,
    ForgotPasswordService,
    RefreshTokenService,
    JwtStrategy,
    PrismaService,
  ],
  exports: [
    AuthService,
    RegisterUserService,
    SignInService,
    SignOutService,
    ForgotPasswordService,
    RefreshTokenService,
  ],
})
export class AuthModule {}
