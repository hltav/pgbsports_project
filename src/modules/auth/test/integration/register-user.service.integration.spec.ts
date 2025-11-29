import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RegisterUserService } from '../../services';
import { CreateUserDTO } from './../../../../libs';
import { CryptoService } from './../../../../libs/crypto/services/crypto.service';
import { PrismaService } from './../../../../libs/database';
import { EmailService } from './../../../../libs/services/mailer/mail.service';
import { Role } from '@prisma/client';
import { describe, beforeAll, it, expect, afterAll } from '@jest/globals';
import { jest } from '@jest/globals';

describe('RegisterUserService - Realistic Integration', () => {
  let service: RegisterUserService;
  let prisma: PrismaService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let crypto: CryptoService;
  let mailService: EmailService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserService,
        PrismaService,
        {
          provide: CryptoService,
          useValue: {
            hashPassword: jest.fn((password: string) =>
              Promise.resolve(`hashed-${password}`),
            ),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmailConfirmation: jest.fn(() => Promise.resolve(true)),
          },
        },
      ],
    }).compile();

    service = module.get<RegisterUserService>(RegisterUserService);
    prisma = module.get<PrismaService>(PrismaService);
    crypto = module.get<CryptoService>(CryptoService);
    mailService = module.get<EmailService>(EmailService);

    // Limpa tudo antes dos testes
    await prisma.emailVerification.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a user, hash password, create verification and call email', async () => {
    const createUserDto: CreateUserDTO = {
      firstname: 'Alice',
      lastname: 'Smith',
      nickname: 'alice123',
      email: 'alice@example.com',
      password: 'password',
      role: Role.USER,
    };

    const user = await service.execute(createUserDto);

    // Verifica retorno do service
    expect(user).toMatchObject({
      firstname: 'Alice',
      lastname: 'Smith',
      nickname: 'alice123',
      email: 'alice@example.com',
    });

    // Verifica usuário no banco
    const userInDb = await prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    expect(userInDb).not.toBeNull();
    expect(userInDb!.password).toBe('hashed-password');

    // Verifica token de verificação
    const verification = await prisma.emailVerification.findFirst({
      where: { userId: user.id },
    });
    expect(verification).not.toBeNull();
    expect(verification!.token).toBeDefined();

    jest.spyOn(mailService, 'sendEmailConfirmation').mockResolvedValue();

    // Verifica que o e-mail foi chamado
    expect(
      jest.spyOn(mailService, 'sendEmailConfirmation'),
    ).toHaveBeenCalledWith(
      { email: 'alice@example.com', name: 'Alice' },
      verification!.token,
    );
  });

  it('should prevent duplicate emails', async () => {
    const createUserDto: CreateUserDTO = {
      firstname: 'Bob',
      lastname: 'Johnson',
      nickname: 'bob123',
      email: 'alice@example.com', // mesmo email da Alice
      password: 'password',
      role: Role.USER,
    };

    await expect(service.execute(createUserDto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should prevent duplicate nicknames', async () => {
    const createUserDto: CreateUserDTO = {
      firstname: 'Charlie',
      lastname: 'Brown',
      nickname: 'alice123', // mesmo nickname da Alice
      email: 'charlie@example.com',
      password: 'password',
      role: Role.USER,
    };

    await expect(service.execute(createUserDto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should allow multiple users with unique emails and nicknames', async () => {
    const users: CreateUserDTO[] = [
      {
        firstname: 'David',
        lastname: 'Lee',
        nickname: 'david1',
        email: 'david1@example.com',
        password: 'pw1',
        role: Role.USER,
      },
      {
        firstname: 'Eve',
        lastname: 'Kim',
        nickname: 'eve1',
        email: 'eve1@example.com',
        password: 'pw2',
        role: Role.USER,
      },
    ];

    for (const dto of users) {
      const user = await service.execute(dto);
      expect(user).toMatchObject({
        firstname: dto.firstname,
        email: dto.email,
        nickname: dto.nickname,
      });
    }

    const allUsers = await prisma.user.findMany();
    expect(allUsers.length).toBeGreaterThanOrEqual(3); // Alice + David + Eve
  });
});
