import { Injectable, Logger } from '@nestjs/common';
import { MailerService, ISendMailOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

interface EmailRecipient {
  email: string;
  name: string;
}

type MailRecipient = string | EmailRecipient | Array<string | EmailRecipient>;

enum EmailType {
  GENERAL = 'GENERAL',
  SUPPORT = 'SUPPORT',
  FINANCE = 'FINANCE',
  ADMIN = 'ADMIN',
  NO_REPLY = 'NO_REPLY',
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly frontendUrl: string;
  private readonly emailAddresses: Map<EmailType, string>;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl =
      configService.get('FRONTEND_URL') ?? 'https://localhost:3001';

    // Mapeamento dos emails
    this.emailAddresses = new Map([
      [
        EmailType.GENERAL,
        configService.get('MAIL_FROM', 'contato@rtsportsmanager.com'),
      ],
      [
        EmailType.SUPPORT,
        configService.get('MAIL_SUPPORT', 'suporte@rtsportsmanager.com'),
      ],
      [
        EmailType.FINANCE,
        configService.get('MAIL_FINANCE', 'financeiro@rtsportsmanager.com'),
      ],
      [
        EmailType.ADMIN,
        configService.get('MAIL_ADMIN', 'admin@rtsportsmanager.com'),
      ],
      [
        EmailType.NO_REPLY,
        configService.get('MAIL_NO_REPLY', 'contato@rtsportsmanager.com'),
      ],
    ]);
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

  private getFromEmail(type: EmailType = EmailType.GENERAL): string {
    const email = this.emailAddresses.get(type);
    const name =
      this.configService.get<string>('MAIL_FROM_NAME') ?? 'RT Sports Manager';
    return `"${name}" <${email}>`;
  }
  private async sendMail(
    options: ISendMailOptions,
    emailType: EmailType = EmailType.GENERAL,
  ): Promise<void> {
    const recipientInfo = this.formatRecipientForLog(
      options.to as MailRecipient,
    );

    // Define o remetente baseado no tipo de email
    const mailOptions: ISendMailOptions = {
      ...options,
      from: options.from ?? this.getFromEmail(emailType),
    };

    try {
      await this.mailerService.sendMail(mailOptions);
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

    await this.sendMail(options, EmailType.NO_REPLY);
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

    await this.sendMail(options, EmailType.NO_REPLY);
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

    await this.sendMail(options, EmailType.GENERAL);
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

    await this.sendMail(options, EmailType.NO_REPLY);
  }

  // Método para enviar emails de suporte
  async sendSupportEmail(
    recipient: EmailRecipient,
    subject: string,
    template: string,
    context: Record<string, any>,
  ): Promise<void> {
    const options: ISendMailOptions = {
      to: this.formatRecipient(recipient),
      subject,
      template,
      context,
    };

    await this.sendMail(options, EmailType.SUPPORT);
  }

  // Método para enviar emails financeiros
  async sendFinanceEmail(
    recipient: EmailRecipient,
    subject: string,
    template: string,
    context: Record<string, any>,
  ): Promise<void> {
    const options: ISendMailOptions = {
      to: this.formatRecipient(recipient),
      subject,
      template,
      context,
    };

    await this.sendMail(options, EmailType.FINANCE);
  }

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
