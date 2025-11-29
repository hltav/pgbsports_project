import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './../../../../libs/database';
import { EmailService } from './../../../../libs/services/mailer/mail.service';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { addMinutes } from 'date-fns';
import { ConfirmEmailService } from '../../services';
import { describe, beforeAll, it, afterAll, expect } from '@jest/globals';
import { jest } from '@jest/globals';
import { EmailVerificationType } from '@prisma/client';

const createEmailHash = (email: string): string => {
  return `hash_${email}`;
};

// Crie um mock type-safe
const mockEmailService = {
  sendWelcomeEmail: jest.fn(() => Promise.resolve(true)),
};

describe('ConfirmEmailService - Integration', () => {
  let service: ConfirmEmailService;
  let prisma: PrismaService;
  let mailService: typeof mockEmailService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfirmEmailService,
        PrismaService,
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<ConfirmEmailService>(ConfirmEmailService);
    prisma = module.get<PrismaService>(PrismaService);
    mailService = module.get(EmailService);

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
        searchableEmailHash: createEmailHash('test@example.com'),
      },
    });

    const token = randomUUID();
    const expiresAt = addMinutes(new Date(), 30);

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        type: EmailVerificationType.EMAIL_CONFIRMATION,
      },
    });

    await service.execute(token);

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    expect(updatedUser?.emailVerifiedAt).toBeInstanceOf(Date);

    const verification = await prisma.emailVerification.findUnique({
      where: { token },
    });
    expect(verification).toBeNull();

    expect(mailService.sendWelcomeEmail).toHaveBeenCalled();
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
        searchableEmailHash: createEmailHash('expired@example.com'),
      },
    });

    const token = randomUUID();
    const expiresAt = addMinutes(new Date(), -10);

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        type: EmailVerificationType.EMAIL_CONFIRMATION,
      },
    });

    await expect(service.execute(token)).rejects.toThrow(BadRequestException);
  });
});
