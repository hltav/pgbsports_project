import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

describe('MailService', () => {
  let service: MailService;
  let mockSendMail: jest.Mock;

  beforeEach(async () => {
    mockSendMail = jest.fn().mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: { sendMail: mockSendMail },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('https://test.com') },
        },
      ],
    }).compile();

    service = module.get(MailService);
  });

  it('should send email with correct options', async () => {
    await service.sendForgotPasswordEmail(
      { email: 'user@test.com', name: 'Test User' },
      'test-token',
    );

    expect(mockSendMail).toHaveBeenCalledWith({
      to: 'user@test.com',
      subject: 'Redefinição de Senha',
      template: './forgot-password',
      context: {
        name: 'Test User',
        resetLink: 'https://test.com/reset-password?token=test-token',
      },
    });
  });
});
