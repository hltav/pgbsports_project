import { PrismaService } from '../../../../libs/database/prisma';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../auth.controller';
import { AuthService } from '../../auth.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { UsersService } from '../../../users/users.service';
import {
  ConfirmEmailService,
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

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        CryptoService,
        RegisterUserService,
        SignInService,
        SignInVerifyService,
        SignOutService,
        RefreshTokenService,
        ForgotPasswordService,
        PasswordService,
        JwtHandlerService,
        EmailService,
        ConfigModule,
        ConfigService,
        ConfirmEmailService,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
