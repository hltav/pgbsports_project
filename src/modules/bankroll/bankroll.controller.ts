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
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles } from './../../libs';
import { AuthenticatedRequest } from '../auth/dto/auth.schema';
import { BankrollService } from './bankroll.service';
import {
  GetBankrollDTO,
  CreateBankrollDTO,
  UpdateBankrollDTO,
  GetBankrollHistoryDTO,
} from './z.dto';
import { PatchBankrollDTO } from './z.dto/update-bankroll.dto';
import { FindBankrollHistoryService } from './services/findBankrollHistory.service';

@Controller('bankrolls')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER', 'TEST_USER')
export class BankrollController {
  constructor(
    private readonly bankrollService: BankrollService,
    private readonly bankrollHistoryService: FindBankrollHistoryService,
  ) {}

  @Get()
  async findMyBankrolls(
    @Req() req: AuthenticatedRequest,
  ): Promise<GetBankrollDTO[]> {
    const userId = req.user.id;
    return this.bankrollService.findBankrollsByUserId(userId);
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
    const userId = req.user.id;
    return this.bankrollService.createBankroll({ ...data, userId });
  }

  @Put(':id')
  async updateBankroll(
    @Param('id') id: number,
    @Body() data: UpdateBankrollDTO,
  ): Promise<GetBankrollDTO> {
    return this.bankrollService.updateBankroll(+id, data);
  }

  @Patch(':id')
  async patchBankroll(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: PatchBankrollDTO,
  ): Promise<GetBankrollDTO> {
    return this.bankrollService.patchUpdateBankroll(id, data);
  }

  @Delete(':id')
  async deleteBankroll(@Param('id') id: number): Promise<GetBankrollDTO> {
    return this.bankrollService.deleteBankroll(+id);
  }

  @Get(':id/history')
  async findBankrollHistory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetBankrollHistoryDTO[]> {
    return this.bankrollHistoryService.findByBankrollId(id);
  }

  // 🟦 Buscar o último registro de histórico da banca
  @Get(':id/history/last')
  async findLastBankrollHistory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetBankrollHistoryDTO | null> {
    return this.bankrollHistoryService.findLastByBankrollId(id);
  }
}
