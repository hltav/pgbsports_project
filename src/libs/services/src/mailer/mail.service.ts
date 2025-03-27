/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

interface EmailRecipient {
  email: string;
  name: string;
}

interface EmailOptions {
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    configService: ConfigService,
  ) {
    this.frontendUrl = configService.get(
      'FRONTEND_URL',
      'https://localhost:3000',
    );
  }

  /**
   * Envia e-mail de redefinição de senha
   * @param recipient Informações do destinatário
   * @param resetToken Token para redefinição de senha
   * @throws {MailSendError} Quando ocorre falha no envio
   */
  async sendForgotPasswordEmail(
    recipient: EmailRecipient,
    resetToken: string,
  ): Promise<void> {
    const resetLink = this.buildResetPasswordLink(resetToken);

    try {
      await this.mailerService.sendMail({
        to: recipient.email,
        subject: 'Redefinição de Senha',
        template: './forgot-password',
        context: {
          name: recipient.name,
          resetLink,
        },
      });
      this.logSuccess(recipient.email);
    } catch (error) {
      this.handleError(error, recipient.email);
      throw new MailSendError('Failed to send password reset email');
    }
  }

  private buildResetPasswordLink(token: string): string {
    return `${this.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  }

  private logSuccess(email: string): void {
    this.logger.log(`Password reset email successfully sent to ${email}`);
  }

  private handleError(error: unknown, email: string): void {
    if (error instanceof Error) {
      this.logger.error(`Email sending failed to ${email}`, {
        message: error.message,
        stack: error.stack,
      });
    } else {
      this.logger.error(`Unexpected error sending email to ${email}`, {
        error: String(error),
      });
    }
  }
}

class MailSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MailSendError';
  }
}
