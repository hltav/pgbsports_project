import { BadRequestException, Injectable } from '@nestjs/common';
import { EmailService } from './../../../libs/services/mailer/mail.service';
import { PrismaService } from './../../../libs/database/prisma/prisma.service';
import { EncryptionService } from './../../../libs/EncryptedData/services/encryptedData.service';

@Injectable()
export class ConfirmEmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async execute(token: string): Promise<void> {
    const verification = await this.prisma.emailVerification.findFirst({
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

    const plainEmail = this.encryptionService.decrypt(verification.user.email);
    const plainName = this.encryptionService.decrypt(
      verification.user.firstname,
    );

    await this.emailService.sendWelcomeEmail({
      email: plainEmail,
      name: plainName,
    });
  }
}
