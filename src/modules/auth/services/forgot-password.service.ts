import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../libs/database/prisma';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { ForgotPasswordDTO } from '../../../libs/common/dto/user/forgot-password.dto';

@Injectable()
export class ForgotPasswordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(forgotPasswordDto: ForgotPasswordDTO): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) return;

    const resetToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '1h' },
    );

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password reset',
      template: 'forgot-password',
      context: {
        name: user.firstname,
        resetLink: `https://localhost:3000/reset-password?token=${resetToken}`,
      },
    });
  }
}
