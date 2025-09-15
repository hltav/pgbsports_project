// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../../../libs/database/prisma';
// import { JwtService } from '@nestjs/jwt';
// import { ForgotPasswordDTO } from '../../../libs/common/dto/user/forgotPassword.dto';
// import { EncryptionService } from '../../../libs/EncryptedData/services/encryptedData.service';
// import { EmailService } from '../../../libs/services/mailer/mail.service';

// @Injectable()
// export class ForgotPasswordService {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly jwtService: JwtService,
//     private readonly encryptionService: EncryptionService,
//     private readonly emailService: EmailService,
//   ) {}

//   async execute(forgotPasswordDto: ForgotPasswordDTO): Promise<void> {
//     const searchableEmailHash = this.encryptionService.generateSearchableHash(
//       forgotPasswordDto.email.toLowerCase(),
//     );

//     const user = await this.prisma.user.findUnique({
//       where: { searchableEmailHash },
//     });

//     if (!user) return;

//     const decryptedEmail = this.encryptionService.decrypt(user.email);
//     const decryptedFirstname = this.encryptionService.decrypt(user.firstname);

//     const resetToken = this.jwtService.sign(
//       { sub: user.id },
//       { expiresIn: '1h' },
//     );

//     await this.emailService.sendForgotPasswordEmail(
//       { email: decryptedEmail, name: decryptedFirstname },
//       resetToken,
//     );
//   }
// }

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../libs/database/prisma';
import { ForgotPasswordDTO } from '../../../libs/common/dto/user/forgotPassword.dto';
import { EncryptionService } from '../../../libs/EncryptedData/services/encryptedData.service';
import { EmailService } from '../../../libs/services/mailer/mail.service';
import { EmailVerificationService } from '../../../libs/services/mailer/emailVerification.service';

@Injectable()
export class ForgotPasswordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly emailService: EmailService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async execute(forgotPasswordDto: ForgotPasswordDTO): Promise<void> {
    // 1️⃣ Buscar usuário pelo email
    const searchableEmailHash = this.encryptionService.generateSearchableHash(
      forgotPasswordDto.email.toLowerCase(),
    );

    const user = await this.prisma.user.findUnique({
      where: { searchableEmailHash },
    });

    if (!user) return; // não vaza info sobre usuários inexistentes

    const decryptedEmail = this.encryptionService.decrypt(user.email);
    const decryptedFirstname = this.encryptionService.decrypt(user.firstname);

    // 2️⃣ Criar token no banco (EmailVerification)
    const emailVerification = await this.emailVerificationService.createToken(
      user.id,
      'RESET_PASSWORD',
      1, // válido por 1 hora
    );

    console.log('=== DEBUG TOKEN ===');
    console.log(
      'Token gerado pelo EmailVerificationService:',
      emailVerification.token,
    );
    console.log('Tipo:', typeof emailVerification.token);
    console.log('Comprimento:', emailVerification.token.length);
    console.log('É JWT?', emailVerification.token.includes('.'));
    console.log('===================');

    // 3️⃣ Enviar email com o token correto do banco
    await this.emailService.sendForgotPasswordEmail(
      { email: decryptedEmail, name: decryptedFirstname },
      emailVerification.token,
    );
    console.log('Email enviado para:', decryptedEmail);
  }
}
