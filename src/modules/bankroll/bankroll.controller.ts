/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles } from './../../libs';
import {
  GetBankrollDTO,
  CreateBankrollDTO,
  UpdateBankrollDTO,
} from './../../libs/common/dto/bankroll';
import { AuthenticatedRequest } from '../auth/dto/auth.schema';
import { BankrollService } from './bankroll.service';

@Controller('bankrolls')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER', 'TEST_USER')
export class BankrollController {
  constructor(private readonly bankrollService: BankrollService) {}

  @Get()
  async findAllBankrolls(): Promise<GetBankrollDTO[]> {
    return this.bankrollService.findAllBankrolls();
  }

  @Get(':id/bank')
  async findBankrollById(@Param('id') id: string): Promise<GetBankrollDTO> {
    return this.bankrollService.findBankrollById(+id);
  }

  @Get('user/:userId')
  async findBankrollsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<GetBankrollDTO[]> {
    return this.bankrollService.findBankrollsByUserId(userId);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createBankroll(
    @Body() data: CreateBankrollDTO,
    @Req() req: AuthenticatedRequest,
  ): Promise<GetBankrollDTO> {
    return this.bankrollService.createBankroll(data);
  }

  @Put(':id')
  async updateBankroll(
    @Param('id') id: string,
    @Body() data: UpdateBankrollDTO,
  ): Promise<GetBankrollDTO> {
    return this.bankrollService.updateBankroll(+id, data);
  }

  @Delete(':id')
  async deleteBankroll(@Param('id') id: string): Promise<GetBankrollDTO> {
    return this.bankrollService.deleteBankroll(+id);
  }
}
