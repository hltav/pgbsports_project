import { PrismaService } from '../../libs/database/prisma';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { UsersService } from '../users/users.service';
import {
  ForgotPasswordService,
  RefreshTokenService,
  RegisterUserService,
  SignInService,
  SignOutService,
} from './services';
import { CryptoService } from './../../libs/crypto/services/crypto.service';
import { PasswordService } from './../../libs/crypto/services/password.service';
import { JwtHandlerService } from './../../libs/crypto/services/jwt.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {}, // Mock do PrismaService
        },
        {
          provide: UsersService,
          useValue: {
            // Mock dos métodos do UsersService que o AuthService usa
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
        SignOutService,
        RefreshTokenService,
        ForgotPasswordService,
        PasswordService,
        JwtHandlerService,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
