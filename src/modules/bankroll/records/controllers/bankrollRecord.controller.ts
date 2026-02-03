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
import { BankrollRecordService } from '../services/bankrollRecord.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../../libs';
import { Prisma } from '@prisma/client';
import { CreateBankrollRecordDTO } from '../dto/record.dto';

interface RequestWithUser extends FastifyRequest {
  user: {
    id: number;
  };
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER', 'TEST_USER')
export class BankrollRecordController {
  constructor(private readonly recordService: BankrollRecordService) {}

  //Cria um novo recorde para o bankroll
  @Post()
  async createRecord(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Body() data: CreateBankrollRecordDTO,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    // Garante que o bankrollId do body seja o mesmo da URL
    const recordData = { ...data, bankrollId };

    return await this.recordService.createRecord(recordData, userId);
  }

  //Lista todos os recordes do bankroll
  // Query opcional: ?type=MAX_DAILY_PROFIT para filtrar por tipo
  @Get()
  async getRecords(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Query('type') type: string | undefined,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    if (type) {
      return await this.recordService.getRecordsByType(
        bankrollId,
        type,
        userId,
      );
    }

    return await this.recordService.getRecordsByBankroll(bankrollId, userId);
  }

  //Retorna os top N recordes de um tipo específico
  //Query params obrigatórios: type, limit
  @Get('top')
  async getTopRecords(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Query('type') type: string,
    @Query('limit') limit: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    const limitNum = parseInt(limit, 10) || 10;

    return await this.recordService.getTopRecords(
      bankrollId,
      type,
      limitNum,
      userId,
    );
  }

  //Busca um recorde específico
  @Get(':recordId')
  async getRecordById(
    @Param('recordId', ParseIntPipe) recordId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.recordService.getRecordById(recordId, userId);
  }

  //Atualiza um recorde (valor e metadata)
  @Put(':recordId')
  async updateRecord(
    @Param('recordId', ParseIntPipe) recordId: number,
    @Body() body: { value: string; metadata: Prisma.InputJsonValue },
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.recordService.updateRecord(
      recordId,
      body.value,
      body.metadata,
      userId,
    );
  }

  //Deleta um recorde específico
  @Delete(':recordId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRecord(
    @Param('recordId', ParseIntPipe) recordId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    await this.recordService.deleteRecord(recordId, userId);
  }

  //Deleta todos os recordes de um tipo específico
  //Query obrigatório: type
  @Delete()
  async deleteRecordsByType(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Query('type') type: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    const count = await this.recordService.deleteRecordsByType(
      bankrollId,
      type,
      userId,
    );

    return {
      message: `${count} recordes do tipo "${type}" foram deletados`,
      count,
    };
  }
}
