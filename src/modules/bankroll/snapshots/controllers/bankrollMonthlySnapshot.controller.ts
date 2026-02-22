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
import { JwtAuthGuard, RolesGuard, Roles } from '../../../../libs';
import { BankrollMonthlySnapshotService } from '../services/bankrollMonthlySnapshot.service';
import { CreateMonthlySnapshotDTO } from '../dto/monthlySnapshot.dto';
import { Role } from '@prisma/client';

interface RequestWithUser extends FastifyRequest {
  user: {
    id: number;
  };
}

@Controller('monthly')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER, Role.TEST_USER)
export class BankrollMonthlySnapshotController {
  constructor(
    private readonly snapshotService: BankrollMonthlySnapshotService,
  ) {}

  //Cria um novo snapshot mensal
  @Post()
  async createSnapshot(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Body() data: CreateMonthlySnapshotDTO,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    // Garante que o bankrollId do body seja o mesmo da URL
    const snapshotData = { ...data, bankrollId };

    return await this.snapshotService.createSnapshot(snapshotData, userId);
  }

  //Lista todos os snapshots mensais do bankroll
  //Query opcional: ?year=2024 para filtrar por ano
  @Get()
  async getSnapshots(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Query('year') year: string | undefined,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    if (year) {
      return await this.snapshotService.getSnapshotsByYear(
        bankrollId,
        parseInt(year, 10),
        userId,
      );
    }

    return await this.snapshotService.getSnapshotsByBankroll(
      bankrollId,
      userId,
    );
  }

  //Retorna o snapshot mensal mais recente  @Get('latest')
  async getLatestSnapshot(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.snapshotService.getLatestSnapshot(bankrollId, userId);
  }

  //Busca snapshot de um mês específico
  @Get(':year/:month')
  async getSnapshotByMonth(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.snapshotService.getSnapshotByMonth(
      bankrollId,
      year,
      month,
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
  //Atualiza um snapshot existente
  @Put(':snapshotId')
  async updateSnapshot(
    @Param('snapshotId', ParseIntPipe) snapshotId: number,
    @Body() data: Partial<CreateMonthlySnapshotDTO>,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.snapshotService.updateSnapshot(snapshotId, data, userId);
  }

  //Deleta um snapshot específico
  @Delete(':snapshotId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSnapshot(
    @Param('snapshotId', ParseIntPipe) snapshotId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    await this.snapshotService.deleteSnapshot(snapshotId, userId);
  }

  // Deleta todos os snapshots de um ano específico
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
