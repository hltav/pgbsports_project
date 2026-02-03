import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService, Decimal } from '../../../../libs/database';
import { OperationType } from '@prisma/client';
import { GetOperationDTO, CreateOperationDTO } from '../dto/operation.dto';

@Injectable()
export class BankrollOperationService {
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

  private async findOperationOrFail(
    operationId: number,
    userId: number,
  ): Promise<GetOperationDTO> {
    const operation = await this.prisma.operation.findUnique({
      where: { id: operationId },
      include: { bankroll: true },
    });

    if (!operation) {
      throw new NotFoundException(`Operação ${operationId} não encontrada`);
    }

    if (operation.bankroll.userId !== userId) {
      throw new ForbiddenException('Acesso negado a esta operação');
    }

    return operation as GetOperationDTO;
  }

  // CREATE
  async createOperation(
    data: CreateOperationDTO,
    userId: number,
  ): Promise<GetOperationDTO> {
    await this.validateBankrollOwnership(data.bankrollId, userId);

    // Valida relatedBankrollId se fornecido
    if (data.relatedBankrollId) {
      await this.validateBankrollOwnership(data.relatedBankrollId, userId);
    }

    // Valida tipos de operação que exigem relatedBankrollId
    if (data.type === 'TRANSFER' && !data.relatedBankrollId) {
      throw new BadRequestException(
        'Operação de TRANSFER requer relatedBankrollId',
      );
    }

    const operation = await this.prisma.operation.create({
      data: {
        ...data,
        amount: new Decimal(data.amount),
      },
    });

    return operation as GetOperationDTO;
  }

  // READ
  async getOperationsByBankroll(
    bankrollId: number,
    userId: number,
  ): Promise<GetOperationDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const operations = await this.prisma.operation.findMany({
      where: { bankrollId },
      orderBy: { date: 'desc' },
    });

    return operations as GetOperationDTO[];
  }

  async getOperationById(
    operationId: number,
    userId: number,
  ): Promise<GetOperationDTO> {
    return this.findOperationOrFail(operationId, userId);
  }

  async getOperationsByType(
    bankrollId: number,
    type: OperationType,
    userId: number,
  ): Promise<GetOperationDTO[]> {
    await this.validateBankrollOwnership(bankrollId, userId);

    const operations = await this.prisma.operation.findMany({
      where: {
        bankrollId,
        type,
      },
      orderBy: { date: 'desc' },
    });

    return operations as GetOperationDTO[];
  }

  // DELETE
  async deleteOperation(operationId: number, userId: number): Promise<void> {
    await this.findOperationOrFail(operationId, userId);

    await this.prisma.operation.delete({
      where: { id: operationId },
    });
  }
}
