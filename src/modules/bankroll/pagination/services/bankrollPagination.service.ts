import { Injectable } from '@nestjs/common';
import { PaginationDTO } from '../dto/pagination.dto';

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable()
export class BankrollPaginationService {
  //Calcula skip e take para queries do Prisma
  calculatePagination(params: PaginationDTO) {
    const { page, limit } = params;

    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  //Monta o objeto de ordenação para o Prisma
  buildOrderBy(params: PaginationDTO) {
    const { sortBy, sortOrder } = params;

    if (!sortBy) return undefined;

    return {
      [sortBy]: sortOrder,
    };
  }

  //Formata resultado paginado com metadata
  formatPaginatedResult<T>(
    data: T[],
    total: number,
    params: PaginationDTO,
  ): PaginatedResult<T> {
    const { page, limit } = params;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  //Helper completo: calcula pagination + orderBy
  getPrismaParams(params: PaginationDTO) {
    return {
      ...this.calculatePagination(params),
      orderBy: this.buildOrderBy(params),
    };
  }
}
