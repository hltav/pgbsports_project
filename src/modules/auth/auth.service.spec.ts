import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../libs/database/prisma';
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
          useValue: {}, // 🔥 Mock PrismaService
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
        {
          provide: MailerService,
          useValue: { sendMail: jest.fn() },
        },
        RegisterUserService,
        SignInService,
        SignOutService,
        RefreshTokenService,
        ForgotPasswordService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
