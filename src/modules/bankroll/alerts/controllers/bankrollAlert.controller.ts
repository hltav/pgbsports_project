import {
  CreateBankrollAlertDTO,
  CreateBankrollAlertSchema,
  UpdateBankrollAlertDTO,
  UpdateBankrollAlertSchema,
} from '../dto/alert.dto';
import { BankrollAlertService } from '../services/bankrollAlert.service';
import { JwtAuthGuard, RolesGuard, Roles } from './../../../../libs';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER', 'TEST_USER')
export class BankrollAlertController {
  constructor(private bankrollAlert: BankrollAlertService) {}

  // CREATE
  @Post()
  async create(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Body() body: CreateBankrollAlertDTO,
  ) {
    const parsed = CreateBankrollAlertSchema.parse({ ...body, bankrollId });
    return this.bankrollAlert.create(parsed);
  }

  // GET BY ID
  @Get(':id')
  async findOne(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bankrollAlert.findOne(bankrollId, id);
  }

  // LIST BY BANKROLL
  @Get()
  async listByBankroll(@Param('bankrollId', ParseIntPipe) bankrollId: number) {
    return this.bankrollAlert.findByBankroll(bankrollId);
  }

  // UPDATE
  @Patch(':id')
  async update(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateBankrollAlertDTO,
  ) {
    const parsed = UpdateBankrollAlertSchema.parse(body);

    return this.bankrollAlert.update(id, parsed, bankrollId);
  }

  // DELETE
  @Delete(':id')
  async delete(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bankrollAlert.delete(bankrollId, id);
  }
}
