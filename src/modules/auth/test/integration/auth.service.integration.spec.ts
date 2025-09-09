import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './../../auth.service';
import { PrismaService } from './../../../../libs/database/prisma';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { UsersService } from './../../../users/users.service';
import {
  ForgotPasswordService,
  RefreshTokenService,
  RegisterUserService,
  SignInService,
  SignOutService,
} from './../../services';
import { CryptoService } from './../../../../libs/crypto/services/crypto.service';
import { PasswordService } from './../../../../libs/crypto/services/password.service';
import { JwtHandlerService } from './../../../../libs/crypto/services/jwt.service';
import { SignInVerifyService } from './../../services/signInVerify.service';
import { EmailService } from './../../../../libs/services/mailer/mail.service';
import { ConfigService } from '@nestjs/config';
import { CreateUserDTO } from './../../../../libs';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role, User, EmailVerification } from '@prisma/client';
import { UsersModule } from './../../../../modules/users/users.module';
import {
  UserFindService,
  UserUpdateService,
  UserDeleteService,
} from './../../../../modules/users/services';

describe('AuthService (integration)', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let passwordService: PasswordService;
  let cryptoService: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
      providers: [
        AuthService,
        RegisterUserService,
        SignInService,
        SignInVerifyService,
        SignOutService,
        ForgotPasswordService,
        RefreshTokenService,
        UsersService,
        UserFindService,
        UserUpdateService,
        UserDeleteService,
        CryptoService,
        PasswordService,
        JwtHandlerService,
        EmailService,
        ConfigService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            refreshToken: {
              create: jest.fn(),
              deleteMany: jest.fn(),
              findFirst: jest.fn(),
            },
            emailVerification: {
              create: jest.fn(),
              findFirst: jest.fn(),
              deleteMany: jest.fn(),
            },
            clientData: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-jwt-token'),
            verify: jest
              .fn()
              .mockReturnValue({ sub: '1', email: 'test@test.com' }),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    passwordService = module.get<PasswordService>(PasswordService);
    cryptoService = module.get<CryptoService>(CryptoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('deve criar usuário com todos os campos e senha hasheada', async () => {
      // Arrange
      const dto: CreateUserDTO = {
        firstname: 'John',
        lastname: 'Doe',
        nickname: 'johndoe',
        email: 'test@test.com',
        password: '123456',
        role: Role.USER,
      };

      const mockUser = {
        id: 1,
        firstname: dto.firstname,
        lastname: dto.lastname,
        nickname: dto.nickname,
        email: dto.email,
        password: 'hashed_123456',
        role: Role.USER,
        clientData: null,
        refreshToken: null,
        emailVerifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockEmailVerification: EmailVerification = {
        id: 1,
        userId: 1,
        token: 'verification-token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        verified: false,
        createdAt: new Date(),
      };

      interface EmailVerificationInput {
        userId: number;
        token: string;
        expiresAt: Date;
        verified: boolean;
      }

      const findUniqueSpy = jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(null);
      const createSpy = jest
        .spyOn(prisma.user, 'create')
        .mockResolvedValue(mockUser);
      const emailVerificationSpy = jest
        .spyOn(prisma.emailVerification, 'create')
        .mockResolvedValue(mockEmailVerification);
      jest.spyOn(passwordService, 'hash').mockResolvedValue('hashed_123456');

      const result = await authService.register(dto);

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { email: dto.email },
      });

      expect(createSpy).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstname: 'John',
          lastname: 'Doe',
          nickname: 'johndoe',
          email: 'test@test.com',
          password: 'hashed_123456',
          role: 'USER',
        }) as unknown as User,
      });
      // Código corrigido e mais seguro

      expect(emailVerificationSpy).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 1,
          token: expect.stringMatching(/.+/) as unknown as string,
          expiresAt: expect.any(Date) as unknown as Date,
          verified: expect.any(Boolean) as unknown as boolean,
        }) as EmailVerificationInput,
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          nickname: 'johndoe',
          email: 'test@test.com',
          role: 'USER',
        }),
      );
    });

    it('deve falhar ao tentar registrar email duplicado', async () => {
      // Arrange
      const dto: CreateUserDTO = {
        firstname: 'John',
        lastname: 'Doe',
        nickname: 'johndoe',
        email: 'duplicate@test.com',
        password: '123456',
        role: Role.USER,
      };

      const existingUser = {
        id: 1,
        firstname: dto.firstname,
        lastname: dto.lastname,
        nickname: dto.nickname,
        email: dto.email,
        password: 'hashed_123456',
        role: Role.USER,
        refreshToken: null,
        emailVerifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(existingUser);

      // Act & Assert
      await expect(authService.register(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('signIn', () => {
    it('deve fazer login com credenciais válidas', async () => {
      // Arrange
      const email = 'valid@test.com';
      const password = '123456';
      const hashedPassword = await bcrypt.hash(password, 10);

      interface SignInResult {
        accessToken: string;
        refreshToken: string;
        user: Partial<User>;
      }

      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        nickname: 'johndoe',
        email: email,
        password: hashedPassword,
        role: Role.USER,
        emailVerifiedAt: null,
        refreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...user,
        refreshToken: 'refresh-token',
        updatedAt: new Date(),
      };

      // Mocks
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser);

      // Mock do CryptoService para comparar senha
      jest.spyOn(cryptoService, 'comparePassword').mockResolvedValue(true);

      // Act
      const result = await authService.signIn(email, password);

      // Assert
      expect(result).toEqual({
        accessToken: 'mocked-jwt-token',
        refreshToken: 'refresh-token',
        user: expect.objectContaining({
          id: 1,
          email: 'valid@test.com',
          firstname: 'John',
          lastname: 'Doe',
        }) as Partial<User>,
      } as SignInResult);
    });

    it('deve falhar ao fazer login com senha inválida', async () => {
      // Arrange
      const email = 'valid@test.com';
      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        nickname: 'johndoe',
        email: email,
        password: await bcrypt.hash('correct_password', 10),
        role: Role.USER,
        emailVerifiedAt: new Date(), // ← IMPORTANTE: email deve estar verificado
        refreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Cria os spies
      const findUniqueSpy = jest.spyOn(prisma.user, 'findUnique');
      const updateSpy = jest.spyOn(prisma.user, 'update');
      const comparePasswordSpy = jest.spyOn(cryptoService, 'comparePassword');

      // Mock do Prisma
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

      // Mock do CryptoService para falhar na comparação
      jest.spyOn(cryptoService, 'comparePassword').mockResolvedValue(false);

      // Act & Assert
      await expect(authService.signIn(email, 'wrong_password')).rejects.toThrow(
        UnauthorizedException,
      );

      // Assert: Verifica que buscou o usuário
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { email: 'valid@test.com' },
      });

      // Assert: Verifica que NÃO atualizou o usuário (porque falhou o login)
      expect(updateSpy).not.toHaveBeenCalled(); // ← AQUI É O .not!

      // Assert: Verifica que comparou a senha
      expect(comparePasswordSpy).toHaveBeenCalledWith(
        'wrong_password',
        user.password,
      );
    });

    describe('refreshToken', () => {
      it('deve renovar token com refresh token válido', async () => {
        // Arrange
        const validRefreshToken = 'valid-refresh-token';

        const user = {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          nickname: 'johndoe',
          email: 'test@test.com',
          password: 'hashed',
          role: Role.USER,
          emailVerifiedAt: null,
          refreshToken: validRefreshToken,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const updatedUser = {
          ...user,
          refreshToken: 'new-refresh-token',
          updatedAt: new Date(),
        };

        // Mocks
        jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(user);
        jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser);

        // Act
        const result = await authService.refreshToken(validRefreshToken);

        // Assert
        expect(result).toEqual({
          accessToken: 'mocked-jwt-token',
          refreshToken: 'new-refresh-token',
        });

        expect(jest.spyOn(prisma.user, 'findFirst')).toHaveBeenCalledWith({
          where: { refreshToken: validRefreshToken },
        });

        expect(jest.spyOn(prisma.user, 'update')).toHaveBeenCalledWith({
          where: { id: 1 },
          data: expect.objectContaining({
            refreshToken: 'refresh-token',
          }) as Partial<User>,
        });
      });
    });
  });
});
