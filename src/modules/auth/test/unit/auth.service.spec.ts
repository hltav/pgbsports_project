import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth.service';
import { PrismaService } from '../../../../libs/database/prisma';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { UsersService } from '../../../users/users.service';
import {
  ForgotPasswordService,
  RefreshTokenService,
  RegisterUserService,
  SignInService,
  SignOutService,
} from '../../services';
import { CryptoService } from '../../../../libs/crypto/services/crypto.service';
import { PasswordService } from '../../../../libs/crypto/services/password.service';
import { JwtHandlerService } from '../../../../libs/crypto/services/jwt.service';
import { SignInVerifyService } from '../../services/signInVerify.service';
import { EmailService } from '../../../../libs/services/mailer/mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { describe, beforeEach, it, expect } from '@jest/globals';
import { jest } from '@jest/globals';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
        {
          provide: MailerService,
          useValue: { sendMail: jest.fn() },
        },
        CryptoService,
        RegisterUserService,
        SignInService,
        SignOutService,
        SignInVerifyService,
        RefreshTokenService,
        ForgotPasswordService,
        PasswordService,
        JwtHandlerService,
        EmailService,
        ConfigModule,
        ConfigService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
