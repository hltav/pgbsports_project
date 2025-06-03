import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database/prisma';
import { GetBankrollDTO } from '../z.dto';

@Injectable()
export class DeleteBankrollService {
  constructor(private prisma: PrismaService) {}

  async deleteBankroll(id: number): Promise<GetBankrollDTO> {
    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        name: true,
        balance: true,
        unidValue: true,
        bookmaker: true,
      },
    });

    if (!bankroll) {
      throw new NotFoundException('Bankroll not found!');
    }

    await this.prisma.bankroll.delete({
      where: { id },
    });

    return {
      ...bankroll,
      statusSync: 'Synchronized',
    };
  }
}
