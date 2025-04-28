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
import { BankrollService } from './bankroll.service';
import { JwtAuthGuard, RolesGuard, Roles } from './../../libs';
import {
  GetBankrollDTO,
  CreateBankrollDTO,
  UpdateBankrollDTO,
} from './../../libs/common/dto/bankroll';
import { AuthenticatedRequest } from '../auth/dto/auth.schema';

@Controller('bankrolls')
export class BankrollController {
  constructor(private readonly bankrollService: BankrollService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async findAllBankrolls(): Promise<GetBankrollDTO[]> {
    return this.bankrollService.findAllBankrolls();
  }

  @Get(':id/bank')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async findBankrollById(@Param('id') id: string): Promise<GetBankrollDTO> {
    return this.bankrollService.findBankrollById(+id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async findBankrollsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<GetBankrollDTO[]> {
    return this.bankrollService.findBankrollsByUserId(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createBankroll(
    @Body() data: CreateBankrollDTO,
    @Req() req: AuthenticatedRequest,
  ): Promise<GetBankrollDTO> {
    return this.bankrollService.createBankroll(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async updateBankroll(
    @Param('id') id: string,
    @Body() data: UpdateBankrollDTO,
  ): Promise<GetBankrollDTO> {
    return this.bankrollService.updateBankroll(+id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async deleteBankroll(@Param('id') id: string): Promise<GetBankrollDTO> {
    return this.bankrollService.deleteBankroll(+id);
  }
}
