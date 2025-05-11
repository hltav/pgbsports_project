import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database/prisma/prisma.service';
import {
  CreateBankrollDTO,
  GetBankrollDTO,
} from './../../../libs/common/dto/bankroll';

@Injectable()
export class CreateBankrollService {
  constructor(private prisma: PrismaService) {}

  async createBankroll(data: CreateBankrollDTO): Promise<GetBankrollDTO> {
    const existingBankroll = await this.prisma.bankroll.findFirst({
      where: { name: data.name },
    });

    if (existingBankroll) {
      throw new ConflictException('Bankroll with this name already exists!');
    }

    return this.prisma.bankroll.create({
      data: {
        name: data.name,
        userId: data.userId,
        balance: data.balance,
        unidValue: data.unidValue,
        bookmaker: data.bookmaker ?? 'Unknown',
        statusSync: data.statusSync ?? 'Synchronizing',
      },
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
