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
import { CreateHourlySnapshotDTO } from '../dto/hourlySnapshot.dto';
import { BankrollHourlySnapshotService } from '../services/bankrollHourlySnapshot.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../../libs';

interface RequestWithUser extends FastifyRequest {
  user: {
    id: number;
  };
}

/**
 * Rotas sugeridas (aninhadas por bankroll):
 * /bankrolls/:bankrollId/snapshots/hourly/...
 *
 * Se você já estiver usando outro prefixo no módulo, ajuste só o @Controller().
 */
@Controller('hourly')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER', 'TEST_USER')
export class BankrollHourlySnapshotController {
  constructor(
    private readonly snapshotService: BankrollHourlySnapshotService,
  ) {}

  // Cria um novo snapshot horário
  @Post()
  async createSnapshot(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Body() data: CreateHourlySnapshotDTO,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    const snapshotData = { ...data, bankrollId };

    return await this.snapshotService.createSnapshot(snapshotData, userId);
  }

  /**
   * Lista snapshots com filtros opcionais
   * Query params:
   * - startDate: data inicial (formato: ISO ou YYYY-MM-DDTHH:mm:ss)
   * - endDate: data final (formato: ISO ou YYYY-MM-DDTHH:mm:ss)
   *
   * Se startDate e endDate vierem, retorna por range.
   * Senão, lista todos do bankroll.
   */
  @Get()
  async getSnapshots(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Query('startDate') startDate: string | undefined,
    @Query('endDate') endDate: string | undefined,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    if (startDate && endDate) {
      return await this.snapshotService.getSnapshotsByDateRange(
        bankrollId,
        new Date(startDate),
        new Date(endDate),
        userId,
      );
    }

    return await this.snapshotService.getSnapshotsByBankroll(
      bankrollId,
      userId,
    );
  }

  // Retorna o snapshot horário mais recente
  @Get('latest')
  async getLatestSnapshot(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.snapshotService.getLatestSnapshot(bankrollId, userId);
  }

  /**
   * Busca snapshot por bucketStart (início da hora)
   * Ex:
   * GET /hourly/bucket?bucketStart=2026-01-31T13:00:00.000Z
   */
  @Get('bucket')
  async getSnapshotByBucketStart(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Query('bucketStart') bucketStart: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.snapshotService.getSnapshotByBucketStart(
      bankrollId,
      new Date(bucketStart),
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
    @Body() data: Partial<CreateHourlySnapshotDTO>,
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

  /**
   * Deleta snapshots por range de datas (bucketStart)
   * Ex:
   * DELETE /hourly/range?startDate=2026-01-31T00:00:00.000Z&endDate=2026-02-01T00:00:00.000Z
   */
  @Delete('range')
  async deleteSnapshotsByDateRange(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    const count = await this.snapshotService.deleteSnapshotsByDateRange(
      bankrollId,
      new Date(startDate),
      new Date(endDate),
      userId,
    );

    return {
      message: `${count} snapshots entre ${startDate} e ${endDate} foram deletados`,
      count,
    };
  }
}
