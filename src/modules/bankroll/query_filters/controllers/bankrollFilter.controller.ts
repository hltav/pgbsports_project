import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Result, MatchStatus, OperationType } from '@prisma/client';
import { FastifyRequest } from 'fastify';
import { BankrollFilterService } from '../services/bankrollFilter.service';
import { JwtAuthGuard, RolesGuard, Roles } from 'src/libs';
import {
  BankrollFilterDTO,
  EventFilterDTO,
  HistoryFilterDTO,
} from '../dto/query_filter.dto';
import { PaginationDTO } from '../../pagination/dto/pagination.dto';

interface RequestWithUser extends FastifyRequest {
  user: {
    id: number;
  };
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER', 'TEST_USER')
export class BankrollFilterController {
  constructor(private readonly filterService: BankrollFilterService) {}

  @Get('bankrolls')
  async filterBankrolls(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Query('isActive') isActive: string | undefined,
    @Query('bookmaker') bookmaker: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' | undefined,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    const filters: BankrollFilterDTO = {
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      bookmaker,
      bankrollId,
    };

    const pagination: PaginationDTO = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy,
      sortOrder: sortOrder ?? 'desc',
    };

    return await this.filterService.filterBankrolls(
      filters,
      pagination,
      userId,
    );
  }

  @Get('events')
  async filterEvents(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Query('result') result: Result | undefined,
    @Query('status') status: MatchStatus | undefined,
    @Query('modality') modality: string | undefined,
    @Query('market') market: string | undefined,
    @Query('startDate') startDate: string | undefined,
    @Query('endDate') endDate: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' | undefined,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    const filters: EventFilterDTO = {
      bankrollId: bankrollId,
      result,
      status,
      modality,
      market,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const pagination: PaginationDTO = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy,
      sortOrder: sortOrder ?? 'desc',
    };

    return await this.filterService.filterEvents(filters, pagination, userId);
  }

  @Get('history')
  async filterHistory(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Query('type') type: OperationType | undefined,
    @Query('startDate') startDate: string | undefined,
    @Query('endDate') endDate: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' | undefined,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    const filters: HistoryFilterDTO = {
      bankrollId,
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const pagination: PaginationDTO = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy,
      sortOrder: sortOrder ?? 'desc',
    };

    return await this.filterService.filterHistory(filters, pagination, userId);
  }
}
