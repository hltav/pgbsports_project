/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './../../../../libs/database';
import { EmailService } from './../../../../libs/services/mailer/mail.service';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { addMinutes } from 'date-fns';
import { ConfirmEmailService } from '../../services';

describe('ConfirmEmailService - Integration', () => {
  let service: ConfirmEmailService;
  let prisma: PrismaService;
  let mailService: EmailService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfirmEmailService,
        PrismaService,
        {
          provide: EmailService,
          useValue: {
            sendWelcomeEmail: jest.fn(() => Promise.resolve(true)),
          },
        },
      ],
    }).compile();

    service = module.get<ConfirmEmailService>(ConfirmEmailService);
    prisma = module.get<PrismaService>(PrismaService);
    mailService = module.get<EmailService>(EmailService);

    await prisma.emailVerification.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should confirm email successfully with valid token', async () => {
    const user = await prisma.user.create({
      data: {
        firstname: 'Test',
        lastname: 'User',
        nickname: 'testuser',
        email: 'test@example.com',
        password: 'hashed-password',
      },
    });

    const token = randomUUID();
    const expiresAt = addMinutes(new Date(), 30);

    await prisma.emailVerification.create({
      data: { userId: user.id, token, expiresAt },
    });

    await service.execute(token);

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    expect(updatedUser!.emailVerifiedAt).toBeInstanceOf(Date);

    const verification = await prisma.emailVerification.findUnique({
      where: { token },
    });
    expect(verification).toBeNull();

    expect(mailService.sendWelcomeEmail).toHaveBeenCalledWith({
      email: user.email,
      name: user.firstname,
    });
  });

  it('should throw BadRequestException for invalid token', async () => {
    await expect(service.execute('invalid-token')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException for expired token', async () => {
    const user = await prisma.user.create({
      data: {
        firstname: 'Expired',
        lastname: 'User',
        nickname: 'expireduser',
        email: 'expired@example.com',
        password: 'hashed-password',
      },
    });

    const token = randomUUID();
    const expiresAt = addMinutes(new Date(), -10);

    await prisma.emailVerification.create({
      data: { userId: user.id, token, expiresAt },
    });

    await expect(service.execute(token)).rejects.toThrow(BadRequestException);
  });
});
