import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../../libs/database/prisma/prisma.service';
import {
  CreateBankrollAlertDTO,
  GetBankrollAlertDTO,
  CreateBankrollAlertSchema,
  UpdateBankrollAlertDTO,
  UpdateBankrollAlertSchema,
} from '../dto/alert.dto';

@Injectable()
export class BankrollAlertService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE
  async create(data: CreateBankrollAlertDTO): Promise<GetBankrollAlertDTO> {
    const parsed = CreateBankrollAlertSchema.parse(data);

    const alert = await this.prisma.bankrollAlert.create({
      data: parsed,
    });

    return alert as GetBankrollAlertDTO;
  }

  // FIND ALL BY BANKROLL
  async findByBankroll(bankrollId: number): Promise<GetBankrollAlertDTO[]> {
    const alerts = await this.prisma.bankrollAlert.findMany({
      where: { bankrollId },
      orderBy: { createdAt: 'desc' },
    });

    return alerts as GetBankrollAlertDTO[];
  }

  // FIND ONE
  async findOne(bankrollId: number, id: number): Promise<GetBankrollAlertDTO> {
    const alert = await this.prisma.bankrollAlert.findUnique({
      where: { bankrollId, id },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found.');
    }

    return alert as GetBankrollAlertDTO;
  }

  // UPDATE
  async update(
    id: number,
    data: UpdateBankrollAlertDTO,
    bankrollId: number,
  ): Promise<GetBankrollAlertDTO> {
    const parsed = UpdateBankrollAlertSchema.parse(data);

    const alert = await this.prisma.bankrollAlert.findFirst({
      where: { id, bankrollId },
    });

    if (!alert) throw new NotFoundException('Alert not found.');

    const updated = await this.prisma.bankrollAlert.update({
      where: { id },
      data: parsed,
    });

    return updated as GetBankrollAlertDTO;
  }

  // DELETE
  async delete(bankrollId: number, id: number): Promise<void> {
    const alert = await this.prisma.bankrollAlert.findUnique({
      where: { bankrollId, id },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found.');
    }

    await this.prisma.bankrollAlert.delete({
      where: { id },
    });
  }
}
