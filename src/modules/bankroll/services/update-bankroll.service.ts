import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database/prisma';
import { UpdateBankrollDTO } from './../../../libs/common/dto/bankroll';
import { GetBankrollDTO } from './../../../libs/common/dto/bankroll';

@Injectable()
export class UpdateBankrollService {
  constructor(private prisma: PrismaService) {}

  async updateBankroll(
    id: number,
    updateData: Partial<UpdateBankrollDTO>,
  ): Promise<GetBankrollDTO> {
    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id },
    });

    if (!bankroll) {
      throw new NotFoundException('Bankroll not found!');
    }

    return this.prisma.bankroll.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        userId: true,
        name: true,
        balance: true,
        unidValue: true,
        bookmaker: true,
        statusSync: true,
      },
    });
  }
}
