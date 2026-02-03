import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../libs/database';
import { Prisma } from '@prisma/client';
import {
  PaginatedResult,
  BankrollPaginationService,
} from '../../pagination/services/bankrollPagination.service';
import {
  BankrollFilterDTO,
  EventFilterDTO,
  HistoryFilterDTO,
} from '../dto/query_filter.dto';
import { PaginationDTO } from '../../pagination/dto/pagination.dto';

@Injectable()
export class BankrollFilterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: BankrollPaginationService,
  ) {}

  // BANKROLLS
  async filterBankrolls(
    filters: BankrollFilterDTO,
    pagination: PaginationDTO,
    requestUserId: number,
  ): Promise<PaginatedResult<any>> {
    // Se não for admin, força filtro pelo próprio userId
    const userId = filters.userId ?? requestUserId;

    if (userId !== requestUserId) {
      throw new ForbiddenException(
        'Você só pode filtrar seus próprios bankrolls',
      );
    }

    const where: Prisma.BankrollWhereInput = { userId };

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.bookmaker) {
      where.bookmaker = {
        contains: filters.bookmaker,
        mode: 'insensitive',
      };
    }

    const { skip, take, orderBy } =
      this.paginationService.getPrismaParams(pagination);

    const [bankrolls, total] = await Promise.all([
      this.prisma.bankroll.findMany({
        where,
        skip,
        take,
        orderBy: orderBy ?? { createdAt: 'desc' },
      }),
      this.prisma.bankroll.count({ where }),
    ]);

    return this.paginationService.formatPaginatedResult(
      bankrolls,
      total,
      pagination,
    );
  }

  // EVENTS
  async filterEvents(
    filters: EventFilterDTO,
    pagination: PaginationDTO,
    requestUserId: number,
  ): Promise<PaginatedResult<any>> {
    const where: Prisma.BetsWhereInput = { userId: requestUserId };

    // Valida ownership do bankroll se fornecido
    if (filters.bankrollId) {
      await this.validateBankrollOwnership(filters.bankrollId, requestUserId);
      where.bankrollId = filters.bankrollId;
    }

    if (filters.result) {
      where.result = filters.result;
    }

    if (filters.modality) {
      where.sport = {
        contains: filters.modality,
        mode: 'insensitive',
      };
    }

    if (filters.market) {
      where.market = {
        contains: filters.market,
        mode: 'insensitive',
      };
    }

    // Filtro de data
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const { skip, take, orderBy } =
      this.paginationService.getPrismaParams(pagination);

    const [events, total] = await Promise.all([
      this.prisma.bets.findMany({
        where,
        skip,
        take,
        orderBy: orderBy ?? { createdAt: 'desc' },
        include: {
          bankroll: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.bets.count({ where }),
    ]);

    return this.paginationService.formatPaginatedResult(
      events,
      total,
      pagination,
    );
  }

  // HISTORY (Operations)
  async filterHistory(
    filters: HistoryFilterDTO,
    pagination: PaginationDTO,
    requestUserId: number,
  ): Promise<PaginatedResult<any>> {
    const where: Prisma.OperationWhereInput = {};

    // Valida ownership do bankroll se fornecido
    if (filters.bankrollId) {
      await this.validateBankrollOwnership(filters.bankrollId, requestUserId);
      where.bankrollId = filters.bankrollId;
    } else {
      // Se não especificar bankroll, busca em todos os bankrolls do usuário
      where.bankroll = {
        userId: requestUserId,
      };
    }

    if (filters.type) {
      where.type = filters.type;
    }

    // Filtro de data
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    const { skip, take, orderBy } =
      this.paginationService.getPrismaParams(pagination);

    const [operations, total] = await Promise.all([
      this.prisma.operation.findMany({
        where,
        skip,
        take,
        orderBy: orderBy ?? { date: 'desc' },
        include: {
          bankroll: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.operation.count({ where }),
    ]);

    return this.paginationService.formatPaginatedResult(
      operations,
      total,
      pagination,
    );
  }

  // HELPER
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
}
