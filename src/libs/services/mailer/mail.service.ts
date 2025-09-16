import { Injectable, Logger } from '@nestjs/common';
import { MailerService, ISendMailOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

interface EmailRecipient {
  email: string;
  name: string;
}

type MailRecipient = string | EmailRecipient | Array<string | EmailRecipient>;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    configService: ConfigService,
  ) {
    this.frontendUrl =
      configService.get('FRONTEND_URL') ?? 'https://localhost:3001';
  }

  private extractEmailAddresses(recipient: MailRecipient): string[] {
    if (typeof recipient === 'string') {
      return [recipient];
    }

    if (Array.isArray(recipient)) {
      return recipient.map((item) =>
        typeof item === 'string' ? item : item.email,
      );
    }

    return [recipient.email];
  }

  private formatRecipientForLog(recipient: MailRecipient): string {
    const emails = this.extractEmailAddresses(recipient);
    return emails.join(', ');
  }

  private async sendMail(options: ISendMailOptions): Promise<void> {
    const recipientInfo = this.formatRecipientForLog(
      options.to as MailRecipient,
    );

    try {
      await this.mailerService.sendMail(options);
      this.logSuccess(recipientInfo);
    } catch (error) {
      this.handleError(error, recipientInfo);
      throw new MailSendError('Failed to send email');
    }
  }

  async sendForgotPasswordEmail(
    recipient: EmailRecipient,
    resetToken: string,
  ): Promise<void> {
    const options: ISendMailOptions = {
      to: this.formatRecipient(recipient),
      subject: 'Redefinição de Senha',
      template: './forgot-password',
      context: {
        name: recipient.name,
        resetLink: this.buildResetPasswordLink(resetToken, recipient.email),
      },
    };

    await this.sendMail(options);
  }

  async sendEmailConfirmation(
    recipient: EmailRecipient,
    verificationToken: string,
  ): Promise<void> {
    const options: ISendMailOptions = {
      to: this.formatRecipient(recipient),
      subject: 'Confirmação de E-mail',
      template: './email-confirmation',
      context: {
        name: recipient.name,
        confirmationLink: this.buildEmailConfirmationLink(
          verificationToken,
          recipient.email,
        ),
      },
    };

    await this.sendMail(options);
  }

  async sendWelcomeEmail(recipient: EmailRecipient): Promise<void> {
    const options: ISendMailOptions = {
      to: this.formatRecipient(recipient),
      subject: 'Bem-vindo à RT Sports Manager!',
      template: './welcome',
      context: {
        name: recipient.name,
      },
    };

    await this.sendMail(options);
  }

  async sendResendConfirmationEmail(
    recipient: EmailRecipient,
    verificationToken: string,
  ): Promise<void> {
    const options: ISendMailOptions = {
      to: `"${recipient.name}" <${recipient.email}>`,
      subject: 'Novo Link de Confirmação de E-mail',
      template: './resend-email-confirmation',
      context: {
        name: recipient.name,
        confirmationLink: this.buildEmailConfirmationLink(
          verificationToken,
          recipient.email,
        ),
      },
    };

    await this.sendMail(options);
  }

  // Helper para formatar o destinatário corretamente para o Nodemailer
  private formatRecipient(recipient: EmailRecipient): string {
    return `"${recipient.name}" <${recipient.email}>`;
  }

  private buildResetPasswordLink(token: string, email: string): string {
    return `${this.frontendUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  }

  private buildEmailConfirmationLink(token: string, email: string): string {
    return `${this.frontendUrl}/confirm-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  }

  private logSuccess(recipient: string): void {
    this.logger.log(`Email successfully sent to ${recipient}`);
  }

  private handleError(error: unknown, recipient: string): void {
    if (error instanceof Error) {
      this.logger.error(`Email sending failed to ${recipient}`, error.stack);
    } else {
      this.logger.error(
        `Unexpected error sending to ${recipient}`,
        String(error),
      );
    }
  }
}

class MailSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MailSendError';
  }
}
