import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendForgotPasswordEmail(to: string, name: string, resetToken: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Redefinição de Senha',
      template: './forgot-password', // Nome do template
      context: {
        name,
        resetLink: `https://localhost:3000/reset-password?token=${resetToken}`,
      },
    });
  }
}
