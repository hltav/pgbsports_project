import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { BankrollGoalService } from '../services/bankrollGoal.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../../libs';
import { CreateBankrollGoalDTO, UpdateBankrollGoalDTO } from '../dto/goal.dto';
import { Role } from '@prisma/client';

interface RequestWithUser extends FastifyRequest {
  user: {
    id: number;
  };
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER, Role.TEST_USER)
export class BankrollGoalController {
  constructor(private readonly goalService: BankrollGoalService) {}

  //Cria uma nova meta para o bankroll
  @Post()
  async createGoal(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Body() data: CreateBankrollGoalDTO,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    const goalData = { ...data, bankrollId };

    return await this.goalService.createGoal(goalData, userId);
  }

  //Lista todas as metas do bankroll
  @Get()
  async getGoals(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.goalService.getGoalsByBankroll(bankrollId, userId);
  }

  //Lista apenas metas ativas do bankroll
  @Get('active')
  async getActiveGoals(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.goalService.getActiveGoals(bankrollId, userId);
  }

  //Busca uma meta específica
  @Get(':goalId')
  async getGoalById(
    @Param('goalId', ParseIntPipe) goalId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.goalService.getGoalById(goalId, userId);
  }

  ///Atualiza uma meta existente
  @Put(':goalId')
  async updateGoal(
    @Param('goalId', ParseIntPipe) goalId: number,
    @Body() data: UpdateBankrollGoalDTO,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    // Garante que o ID seja o mesmo da URL
    const updateData = { ...data, id: goalId };

    return await this.goalService.updateGoal(updateData, userId);
  }

  //Marca uma meta como alcançada
  @Put(':goalId/achieve')
  async achieveGoal(
    @Param('goalId', ParseIntPipe) goalId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.goalService.achieveGoal(goalId, userId);
  }

  //Atualiza o progresso atual da meta
  @Put(':goalId/progress')
  async updateProgress(
    @Param('goalId', ParseIntPipe) goalId: number,
    @Body() body: { currentValue: string },
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    return await this.goalService.updateProgress(
      goalId,
      body.currentValue,
      userId,
    );
  }

  //Desativa uma meta (soft delete)
  @Delete(':goalId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGoal(
    @Param('goalId', ParseIntPipe) goalId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    await this.goalService.deleteGoal(goalId, userId);
  }

  //Deleta permanentemente uma meta
  @Delete(':goalId/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  async hardDeleteGoal(
    @Param('goalId', ParseIntPipe) goalId: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    await this.goalService.hardDeleteGoal(goalId, userId);
  }
}
