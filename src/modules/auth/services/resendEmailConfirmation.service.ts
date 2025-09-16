import { Injectable, NotFoundException } from '@nestjs/common';
import { EMAIL_VERIFICATION_TYPES } from '../../../libs/common/enum/emailVerication.enum';
import { PrismaService } from '../../../libs/database';
import { EmailService } from '../../../libs/services/mailer/mail.service';
import { EmailVerificationService } from '../../../libs/services/mailer/services/emailVerification.service';
import { EncryptionService } from '../../../libs/EncryptedData/services/encryptedData.service';

@Injectable()
export class ResendEmailConfirmationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async execute(email: string): Promise<void> {
    const emailHash = this.encryptionService.generateSearchableHash(email);

    const user = await this.prisma.user.findUnique({
      where: { searchableEmailHash: emailHash },
    });

    if (!user) {
      throw new NotFoundException('Por favor, verifique suas credenciais!');
    }

    const verification = await this.emailVerificationService.createToken(
      user.id,
      EMAIL_VERIFICATION_TYPES.EMAIL_CONFIRMATION,
      24,
    );

    await this.emailService.sendResendConfirmationEmail(
      {
        email: this.encryptionService.decrypt(user.email),
        name: `${this.encryptionService.decrypt(user.firstname)} ${this.encryptionService.decrypt(user.lastname)}`,
      },
      verification.token,
    );
  }
}
