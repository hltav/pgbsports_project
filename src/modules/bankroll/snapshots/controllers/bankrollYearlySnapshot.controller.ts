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
import { CreateYearlySnapshotDTO } from '../dto/yearlySnapshot.dto';
import { FastifyRequest } from 'fastify';
import { BankrollYearlySnapshotService } from '../services/bankrollYearlySnapshot.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../../libs';

interface RequestWithUser extends FastifyRequest {
  user: {
    id: number;
  };
}

@Controller('yearly')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER', 'TEST_USER')
export class BankrollYearlySnapshotController {
  constructor(
    private readonly snapshotService: BankrollYearlySnapshotService,
  ) {}
  //Cria um novo snapshot anual
  @Post()
  async createSnapshot(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Body() data: CreateYearlySnapshotDTO,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    const snapshotData = { ...data, bankrollId };

    return await this.snapshotService.createSnapshot(snapshotData, userId);
  }

  //Lista todos os snapshots anuais do bankroll
  //Query opcional: ?startYear=2020&endYear=2024 para range
  @Get()
  async getSnapshots(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Query('startYear') startYear: string | undefined,
    @Query('endYear') endYear: string | undefined,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    if (startYear && endYear) {
      return await this.snapshotService.getSnapshotsByYearRange(
        bankrollId,
        parseInt(startYear, 10),
        parseInt(endYear, 10),
        userId,
      );
    }

    return await this.snapshotService.getSnapshotsByBankroll(
      bankrollId,
      userId,
    );
  }

  //Retorna o snapshot anual mais recente
  @Get('latest')
  async getLatestSnapshot(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.snapshotService.getLatestSnapshot(bankrollId, userId);
  }

  //Busca snapshot de um ano específico
  @Get(':year')
  async getSnapshotByYear(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Param('year', ParseIntPipe) year: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.snapshotService.getSnapshotByYear(
      bankrollId,
      year,
      userId,
    );
  }

  //Busca snapshot por ID
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
    @Body() data: Partial<CreateYearlySnapshotDTO>,
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

  //Deleta snapshots em um range de anos
  //Query obrigatório: startYear, endYear
  @Delete('range')
  async deleteSnapshotsByRange(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Query('startYear', ParseIntPipe) startYear: number,
    @Query('endYear', ParseIntPipe) endYear: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    const count = await this.snapshotService.deleteSnapshotsByYearRange(
      bankrollId,
      startYear,
      endYear,
      userId,
    );

    return {
      message: `${count} snapshots entre ${startYear} e ${endYear} foram deletados`,
      count,
    };
  }
}
