import { BadRequestException, Injectable } from '@nestjs/common';
import { EmailService } from './../../../libs/services/mailer/mail.service';
import { PrismaService } from './../../../libs/database/prisma/prisma.service';

@Injectable()
export class ConfirmEmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async execute(token: string): Promise<void> {
    const verification = await this.prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification || verification.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    await this.prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerifiedAt: new Date() },
    });

    await this.prisma.emailVerification.delete({
      where: { token },
    });

    await this.emailService.sendWelcomeEmail({
      email: verification.user.email,
      name: verification.user.firstname,
    });
  }
}
