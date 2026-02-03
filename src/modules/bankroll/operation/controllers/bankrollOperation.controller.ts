import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { BankrollOperationService } from '../services/bankrollOperation.service';
import { OperationType } from '@prisma/client';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../../libs';
import { CreateOperationDTO } from '../dto/operation.dto';

interface RequestWithUser extends FastifyRequest {
  user: {
    id: number;
  };
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER', 'TEST_USER')
export class BankrollOperationController {
  constructor(private readonly operationService: BankrollOperationService) {}

  @Post()
  async createOperation(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Body() data: CreateOperationDTO,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    // Garante que o bankrollId do body seja o mesmo da URL
    const operationData = { ...data, bankrollId };

    return await this.operationService.createOperation(operationData, userId);
  }

  @Get()
  async getOperations(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Query('type') type: OperationType | undefined,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    if (type) {
      return await this.operationService.getOperationsByType(
        bankrollId,
        type,
        userId,
      );
    }

    return await this.operationService.getOperationsByBankroll(
      bankrollId,
      userId,
    );
  }

  @Get(':operationId')
  async getOperationById(
    @Param('operationId', ParseIntPipe) operationId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.operationService.getOperationById(operationId, userId);
  }

  @Delete(':operationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOperation(
    @Param('operationId', ParseIntPipe) operationId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    await this.operationService.deleteOperation(operationId, userId);
  }
}
