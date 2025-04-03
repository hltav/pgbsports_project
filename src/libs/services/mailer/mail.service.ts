/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Injectable, Logger } from '@nestjs/common';
import { MailerService, ISendMailOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

interface EmailRecipient {
  email: string;
  name: string;
}

interface EmailOptions extends Omit<ISendMailOptions, 'to'> {}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly frontendUrl: string;
  private readonly sendMail: (options: ISendMailOptions) => Promise<void>;

  constructor(mailerService: MailerService, configService: ConfigService) {
    this.frontendUrl = configService.get(
      'FRONTEND_URL',
      'https://localhost:3000',
    );

    // Vincula o método sendMail para evitar problemas com 'this'
    this.sendMail = async (options) => {
      try {
        await mailerService.sendMail(options);
      } catch (error) {
        this.handleError(error, options.to as string);
        throw new MailSendError('Failed to send email');
      }
    };
  }

  async sendForgotPasswordEmail(
    recipient: EmailRecipient,
    resetToken: string,
  ): Promise<void> {
    const options = this.createForgotPasswordOptions(recipient, resetToken);

    await this.sendMail(options);
    this.logSuccess(recipient.email);
  }

  private createForgotPasswordOptions(
    recipient: EmailRecipient,
    token: string,
  ): ISendMailOptions {
    return {
      to: recipient.email,
      subject: 'Redefinição de Senha',
      template: './forgot-password',
      context: {
        name: recipient.name,
        resetLink: this.buildResetPasswordLink(token),
      },
    };
  }

  private buildResetPasswordLink(token: string): string {
    return `${this.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  }

  private logSuccess(email: string): void {
    this.logger.log(`Email successfully sent to ${email}`);
  }

  private handleError(error: unknown, email: string): void {
    if (error instanceof Error) {
      this.logger.error(`Email sending failed to ${email}`, error.stack);
    } else {
      this.logger.error(`Unexpected error sending to ${email}`, String(error));
    }
  }
}

class MailSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MailSendError';
  }
}
