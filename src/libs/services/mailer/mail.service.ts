import { Injectable, Logger } from '@nestjs/common';
import { MailerService, ISendMailOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

interface EmailRecipient {
  email: string;
  name: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly frontendUrl: string;
  private readonly sendMail: (options: ISendMailOptions) => Promise<void>;

  constructor(
    private readonly mailerService: MailerService,
    configService: ConfigService,
  ) {
    this.frontendUrl = configService.get(
      'FRONTEND_URL',
      'https://localhost:3000',
    );

    this.sendMail = async (options) => {
      try {
        await this.mailerService.sendMail(options);
        this.logSuccess(
          typeof options.to === 'string' ? options.to : '[object Object]',
        );
      } catch (error) {
        this.handleError(
          error,
          typeof options.to === 'string' ? options.to : '[object Object]',
        );
        throw new MailSendError('Failed to send email');
      }
    };
  }

  async sendForgotPasswordEmail(
    recipient: EmailRecipient,
    resetToken: string,
  ): Promise<void> {
    const options: ISendMailOptions = {
      to: recipient.email,
      subject: 'Redefinição de Senha',
      template: './forgot-password',
      context: {
        name: recipient.name,
        resetLink: this.buildResetPasswordLink(resetToken),
      },
    };

    await this.sendMail(options);
  }

  async sendEmailConfirmation(
    recipient: EmailRecipient,
    verificationToken: string,
  ): Promise<void> {
    const options: ISendMailOptions = {
      to: recipient.email,
      subject: 'Confirmação de E-mail',
      template: './email-confirmation',
      context: {
        name: recipient.name,
        confirmationLink: this.buildEmailConfirmationLink(verificationToken),
      },
    };

    await this.sendMail(options);
  }

  async sendWelcomeEmail(recipient: EmailRecipient): Promise<void> {
    const options: ISendMailOptions = {
      to: recipient.email,
      subject: 'Bem-vindo à RT Sports Manager!',
      template: './welcome',
      context: {
        name: recipient.name,
      },
    };

    await this.sendMail(options);
  }

  private buildResetPasswordLink(token: string): string {
    const isDev = process.env.NODE_ENV === 'development';
    const frontendUrl = isDev
      ? 'http://localhost:3001' // Ambiente dev
      : 'http://91.99.55.16:3001'; // Ambiente prod
    return `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  }

  private buildEmailConfirmationLink(token: string): string {
    const isDev = process.env.NODE_ENV === 'development';
    const frontendUrl = isDev
      ? 'http://localhost:3001' // Ambiente dev
      : 'http://91.99.55.16:3001'; // Ambiente prod

    return `${frontendUrl}/confirm-email?token=${encodeURIComponent(token)}`;
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
