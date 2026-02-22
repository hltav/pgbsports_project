import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { CreateDailySnapshotDTO } from '../dto/dailySnapshot.dto';
import { BankrollDailySnapshotService } from '../services/bankrollDailySnapshot.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../../libs';
import { Role } from '@prisma/client';

interface RequestWithUser extends FastifyRequest {
  user: {
    id: number;
  };
}

@Controller('daily')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER, Role.TEST_USER)
export class BankrollDailySnapshotController {
  constructor(private readonly snapshotService: BankrollDailySnapshotService) {}

  //Cria um novo snapshot diário
  @Post()
  async createSnapshot(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Body() data: CreateDailySnapshotDTO,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    const snapshotData = { ...data, bankrollId };

    return await this.snapshotService.createSnapshot(snapshotData, userId);
  }

  // Lista snapshots com filtros opcionais
  // Query params:
  // - year: ano específico
  // - month: mês específico (requer year)
  // - startDate: data inicial (formato: YYYY-MM-DD)
  // - endDate: data final (formato: YYYY-MM-DD)
  @Get()
  async getSnapshots(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Query('year') year: string | undefined,
    @Query('month') month: string | undefined,
    @Query('startDate') startDate: string | undefined,
    @Query('endDate') endDate: string | undefined,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    // Range de datas
    if (startDate && endDate) {
      return await this.snapshotService.getSnapshotsByDateRange(
        bankrollId,
        new Date(startDate),
        new Date(endDate),
        userId,
      );
    }

    // Mês específico
    if (year && month) {
      return await this.snapshotService.getSnapshotsByMonth(
        bankrollId,
        parseInt(year, 10),
        parseInt(month, 10),
        userId,
      );
    }

    // Ano específico
    if (year) {
      return await this.snapshotService.getSnapshotsByYear(
        bankrollId,
        parseInt(year, 10),
        userId,
      );
    }

    // Todos os snapshots
    return await this.snapshotService.getSnapshotsByBankroll(
      bankrollId,
      userId,
    );
  }

  // Retorna o snapshot diário mais recente
  @Get('latest')
  async getLatestSnapshot(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.snapshotService.getLatestSnapshot(bankrollId, userId);
  }

  //Busca snapshot de uma data específica
  @Get(':year/:month/:day')
  async getSnapshotByDate(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Param('day', ParseIntPipe) day: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.snapshotService.getSnapshotByDate(
      bankrollId,
      year,
      month,
      day,
      userId,
    );
  }

  // Busca snapshot por ID
  @Get('id/:snapshotId')
  async getSnapshotById(
    @Param('snapshotId', ParseIntPipe) snapshotId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.snapshotService.getSnapshotById(snapshotId, userId);
  }

  // Atualiza um snapshot existente
  @Put(':snapshotId')
  async updateSnapshot(
    @Param('snapshotId', ParseIntPipe) snapshotId: number,
    @Body() data: Partial<CreateDailySnapshotDTO>,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.snapshotService.updateSnapshot(snapshotId, data, userId);
  }

  // Deleta um snapshot específico
  @Delete(':snapshotId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSnapshot(
    @Param('snapshotId', ParseIntPipe) snapshotId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    await this.snapshotService.deleteSnapshot(snapshotId, userId);
  }

  // Deleta todos os snapshots de um mês
  @Delete('month/:year/:month')
  async deleteSnapshotsByMonth(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    const count = await this.snapshotService.deleteSnapshotsByMonth(
      bankrollId,
      year,
      month,
      userId,
    );

    return {
      message: `${count} snapshots de ${month}/${year} foram deletados`,
      count,
    };
  }

  //Deleta todos os snapshots de um ano
  @Delete('year/:year')
  async deleteSnapshotsByYear(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Param('year', ParseIntPipe) year: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    const count = await this.snapshotService.deleteSnapshotsByYear(
      bankrollId,
      year,
      userId,
    );

    return {
      message: `${count} snapshots do ano ${year} foram deletados`,
      count,
    };
  }
}
