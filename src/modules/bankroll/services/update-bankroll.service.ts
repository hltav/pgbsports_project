import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database/prisma';
import { UpdateBankrollDTO, GetBankrollDTO, PatchBankrollDTO } from '../z.dto';

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

    const updatedBankroll = await this.prisma.bankroll.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        userId: true,
        name: true,
        balance: true,
        unidValue: true,
        bookmaker: true,
      },
    });

    return {
      ...updatedBankroll,
      statusSync: 'Synchronized',
    };
  }

  async patchUpdateBankroll(
    id: number,
    patchData: PatchBankrollDTO,
  ): Promise<GetBankrollDTO> {
    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id },
    });

    if (!bankroll) {
      throw new NotFoundException('Bankroll not found!');
    }

    const updatedBankroll = await this.prisma.bankroll.update({
      where: { id },
      data: {
        ...patchData,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        balance: true,
        unidValue: true,
        bookmaker: true,
      },
    });

    return {
      ...updatedBankroll,
      statusSync: 'Synchronized',
    };
  }
}
