import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { addHours } from 'date-fns';
import { PrismaService } from '../../../database/prisma';
import { EMAIL_VERIFICATION_TYPES } from '../../../common/enum/emailVerication.enum';

@Injectable()
export class EmailVerificationService {
  constructor(private prisma: PrismaService) {}

  async createToken(
    userId: number,
    type: EMAIL_VERIFICATION_TYPES,
    hoursValid = 1,
  ) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = addHours(new Date(), hoursValid);

    return this.prisma.emailVerification.create({
      data: { userId, token, type, expiresAt },
    });
  }

  async validateToken(token: string, type: EMAIL_VERIFICATION_TYPES) {
    const record = await this.prisma.emailVerification.findFirst({
      where: { token, type, used: false, expiresAt: { gt: new Date() } },
    });
    return record;
  }

  async markTokenAsUsed(token: string) {
    return this.prisma.emailVerification.updateMany({
      where: { token },
      data: { used: true },
    });
  }
}
