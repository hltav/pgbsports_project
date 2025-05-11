import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database/prisma';
import { GetBankrollDTO } from './../../../libs/common/dto/bankroll';

@Injectable()
export class DeleteBankrollService {
  constructor(private prisma: PrismaService) {}

  async deleteBankroll(id: number): Promise<GetBankrollDTO> {
    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id },
    });

    if (!bankroll) {
      throw new NotFoundException('Bankroll not found!');
    }

    await this.prisma.bankroll.delete({
      where: { id },
    });

    return bankroll;
  }
}
