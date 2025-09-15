import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../libs/database/prisma';
import { ResetPasswordDTO } from '../../../libs';

@Injectable()
export class ResetPasswordService {
  constructor(private prisma: PrismaService) {}

  async execute({ token, newPassword }: ResetPasswordDTO) {
    const tokenRecord = await this.prisma.emailVerification.findFirst({
      where: {
        token,
        type: 'RESET_PASSWORD',
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Token inválido ou expirado no SERVIDOR.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { password: hashedPassword },
    });

    await this.prisma.emailVerification.update({
      where: { id: tokenRecord.id },
      data: { used: true },
    });

    return { message: 'Senha redefinida com sucesso!' };
  }
}
