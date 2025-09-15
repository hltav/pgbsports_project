import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../libs/database/prisma';
import { ForgotPasswordDTO } from '../../../libs/common/dto/user/forgotPassword.dto';
import { EncryptionService } from '../../../libs/EncryptedData/services/encryptedData.service';
import { EmailService } from '../../../libs/services/mailer/mail.service';
import { EmailVerificationService } from '../../../libs/services/mailer/emailVerification.service';

@Injectable()
export class ForgotPasswordService {
  private readonly logger = new Logger(ForgotPasswordService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly emailService: EmailService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async execute(forgotPasswordDto: ForgotPasswordDTO): Promise<void> {
    const searchableEmailHash = this.encryptionService.generateSearchableHash(
      forgotPasswordDto.email.toLowerCase(),
    );

    const user = await this.prisma.user.findUnique({
      where: { searchableEmailHash },
    });

    if (!user) return;

    const decryptedEmail = this.encryptionService.decrypt(user.email);
    const decryptedFirstname = this.encryptionService.decrypt(user.firstname);

    const emailVerification = await this.emailVerificationService.createToken(
      user.id,
      'RESET_PASSWORD',
      1,
    );

    await this.emailService.sendForgotPasswordEmail(
      { email: decryptedEmail, name: decryptedFirstname },
      emailVerification.token,
    );

    this.logger.log(
      `Token de reset gerado e e-mail enviado para ${decryptedEmail}`,
    );
  }
}
