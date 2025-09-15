import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../libs/database/prisma';
import { ResetPasswordDTO } from '../../../libs';

@Injectable()
export class ResetPasswordService {
  constructor(private prisma: PrismaService) {}

  async execute({ token, newPassword }: ResetPasswordDTO) {
    console.log('Parâmetros de entrada no service:', { token, newPassword });
    // 1️⃣ Buscar token válido
    const tokenRecord = await this.prisma.emailVerification.findFirst({
      where: {
        token,
        type: 'RESET_PASSWORD',
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    console.log('Resultado da consulta do Prisma (tokenRecord):', tokenRecord);

    if (!tokenRecord) {
      throw new BadRequestException('Token inválido ou expirado no SERVIDOR.');
    }

    // 2️⃣ Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3️⃣ Atualizar senha do usuário
    await this.prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { password: hashedPassword },
    });

    // 4️⃣ Marcar token como usado
    await this.prisma.emailVerification.update({
      where: { id: tokenRecord.id },
      data: { used: true },
    });

    return { message: 'Senha redefinida com sucesso!' };
  }
}
