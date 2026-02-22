import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Req,
  Body,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BankrollStreakService } from '../services/bankrollStreak.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../../libs';
import {
  CreateBankrollStreakDTO,
  GetBankrollStreakDTO,
} from '../dto/streak.dto';
import { FastifyRequest } from 'fastify';
import { Role } from '@prisma/client';

interface RequestWithUser extends FastifyRequest {
  user: {
    id: number;
  };
}

@Controller('bankroll_streaks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER, Role.TEST_USER)
export class BankrollStreakController {
  constructor(private readonly service: BankrollStreakService) {}

  // CREATE
  @Post()
  async create(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Body() data: CreateBankrollStreakDTO,
    @Req() req: RequestWithUser,
  ): Promise<GetBankrollStreakDTO> {
    const userId = req.user.id;

    // Garante que o bankrollId do body seja o mesmo da URL
    const streakData = { ...data, bankrollId };

    return this.service.create(streakData, userId);
  }

  // GET BY ID
  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ): Promise<GetBankrollStreakDTO> {
    const userId = req.user.id;

    return this.service.findById(id, userId);
  }

  // GET ALL BY BANKROLL
  @Get()
  async findAllByBankroll(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Req() req: RequestWithUser,
  ): Promise<GetBankrollStreakDTO[]> {
    const userId = req.user.id;

    return this.service.findAllByBankroll(bankrollId, userId);
  }

  // DELETE
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    const userId = req.user.id;

    return this.service.delete(id, userId);
  }
}
