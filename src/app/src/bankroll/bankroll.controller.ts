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
} from '@nestjs/common';
import { BankrollService } from './bankroll.service';
import {
  BankrollCreateDTO,
  BankrollUpdateDTO,
  GetBankrollDTO,
  JwtAuthGuard,
  Roles,
  RolesGuard,
} from '../../../libs/common/src';

@Controller('bankrolls')
export class BankrollController {
  constructor(private readonly bankrollService: BankrollService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async findAllBankrolls(): Promise<GetBankrollDTO[]> {
    return this.bankrollService.findAllBankrolls();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async findBankrollById(@Param('id') id: string): Promise<GetBankrollDTO> {
    return this.bankrollService.findBankrollById(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createBankroll(
    @Body() data: BankrollCreateDTO,
  ): Promise<GetBankrollDTO> {
    return this.bankrollService.createBankroll(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async updateBankroll(
    @Param('id') id: string,
    @Body() data: BankrollUpdateDTO,
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
