import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService, Decimal } from '../../../../libs/database';
import { Prisma } from '@prisma/client';
import {
  GetBankrollRecordDTO,
  CreateBankrollRecordDTO,
} from '../dto/record.dto';

@Injectable()
export class BankrollRecordService {
  constructor(private readonly prisma: PrismaService) {}

  // HELPERS
  private async validateBankrollOwnership(
    bankrollId: number,
    userId: number,
  ): Promise<void> {
    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id: bankrollId },
    });

    if (!bankroll) {
      throw new NotFoundException(`Bankroll ${bankrollId} não encontrado`);
    }

    if (bankroll.userId !== userId) {
      throw new ForbiddenException('Acesso negado a este bankroll');
    }
  }

  private async findRecordOrFail(
    recordId: number,
    userId: number,
  ): Promise<GetBankrollRecordDTO> {
    const record = await this.prisma.bankrollRecord.findUnique({
      where: { id: recordId },
      include: { bankroll: true },
    });

    if (!record) {
      throw new NotFoundException(`Recorde ${recordId} não encontrado`);
    }

    if (record.bankroll.userId !== userId) {
      throw new ForbiddenException('Acesso negado a este recorde');
    }

    return record as GetBankrollRecordDTO;
  }

  // CREATE
  async createRecord(
    data: CreateBankrollRecordDTO,
    userId: number,
  ): Promise<GetBankrollRecordDTO> {
    await this.validateBankrollOwnership(data.bankrollId, userId);

    const record = await this.prisma.bankrollRecord.create({
      data: {
        ...data,
        value: new Decimal(data.value),
      },
    });

    return record as GetBankrollRecordDTO;
  }

  // READ
  async getRecordsByBankroll(
    bankrollId: number,
    userId: number,
  ): Promise<GetBankrollRecordDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const records = await this.prisma.bankrollRecord.findMany({
      where: { bankrollId },
      orderBy: { createdAt: 'desc' },
    });

    return records as GetBankrollRecordDTO[];
  }

  async getRecordsByType(
    bankrollId: number,
    type: string,
    userId: number,
  ): Promise<GetBankrollRecordDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const records = await this.prisma.bankrollRecord.findMany({
      where: {
        bankrollId,
        type,
      },
      orderBy: { value: 'desc' },
    });

    return records as GetBankrollRecordDTO[];
  }

  async getRecordById(
    recordId: number,
    userId: number,
  ): Promise<GetBankrollRecordDTO> {
    return this.findRecordOrFail(recordId, userId);
  }

  async getTopRecords(
    bankrollId: number,
    type: string,
    limit: number,
    userId: number,
  ): Promise<GetBankrollRecordDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const records = await this.prisma.bankrollRecord.findMany({
      where: {
        bankrollId,
        type,
      },
      orderBy: { value: 'desc' },
      take: limit,
    });

    return records as GetBankrollRecordDTO[];
  }

  // UPDATE
  async updateRecord(
    recordId: number,
    value: string | Decimal,
    metadata: Prisma.InputJsonValue | undefined,
    userId: number,
  ): Promise<GetBankrollRecordDTO> {
    await this.findRecordOrFail(recordId, userId);

    const updated = await this.prisma.bankrollRecord.update({
      where: { id: recordId },
      data: {
        value: new Decimal(value),
        ...(metadata !== undefined && { metadata }),
        date: new Date(),
      },
    });

    return updated as GetBankrollRecordDTO;
  }

  // DELETE
  async deleteRecord(recordId: number, userId: number): Promise<void> {
    await this.findRecordOrFail(recordId, userId);

    await this.prisma.bankrollRecord.delete({
      where: { id: recordId },
    });
  }

  async deleteRecordsByType(
    bankrollId: number,
    type: string,
    userId: number,
  ): Promise<number> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const result = await this.prisma.bankrollRecord.deleteMany({
      where: {
        bankrollId,
        type,
      },
    });

    return result.count;
  }
}
