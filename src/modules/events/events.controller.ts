import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard, Roles, RolesGuard } from './../../libs/common';
import { CreateBetDTO, UpdateBetDTO } from './dto/create-event.dto';
import { AuthenticatedRequest } from '../auth/dto/auth.schema';
import { Bets, $Enums, Role } from '@prisma/client';

@Controller('bets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER, Role.TEST_USER)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ==================== CREATE ====================
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createBet(
    @Body() data: CreateBetDTO,
    @Req() req: AuthenticatedRequest,
  ): Promise<Bets> {
    const userId = req.user.id;
    return this.eventsService.createBet(data, userId);
  }

  // ==================== READ ====================
  @Get()
  async getBetsByUser(@Req() req: AuthenticatedRequest): Promise<Bets[]> {
    const userId = req.user.id;
    return this.eventsService.getBetsByUser(userId);
  }

  @Get('filters')
  async getBetsWithFilters(
    @Req() req: AuthenticatedRequest,
    @Query('bankrollId', new ParseIntPipe({ optional: true }))
    bankrollId?: number,
    @Query('result') result?: $Enums.Result,
    @Query('sport') sport?: string,
  ): Promise<Bets[]> {
    const userId = req.user.id;

    return this.eventsService.getBetsWithFilters({
      userId,
      bankrollId,
      result,
      sport,
    });
  }

  @Get('bankroll/:bankrollId')
  async getBetsByBankroll(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
  ): Promise<Bets[]> {
    return this.eventsService.getBetsByBankroll(bankrollId);
  }

  @Get(':id')
  async getBetById(@Param('id', ParseIntPipe) id: number): Promise<Bets> {
    return this.eventsService.getBetById(id);
  }

  // ==================== UPDATE ====================
  @Patch()
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateBet(@Body() data: UpdateBetDTO): Promise<Bets> {
    return this.eventsService.updateBet(data);
  }

  // ==================== DELETE ====================
  @Delete(':id')
  async deleteBet(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string; deletedBet: Bets }> {
    return this.eventsService.deleteBet(id);
  }

  @Delete('batch/multiple')
  async deleteBets(@Body('betIds') betIds: number[]): Promise<{
    message: string;
    deletedCount: number;
    errors: Array<{ betId: number; error: string }>;
  }> {
    return this.eventsService.deleteBets(betIds);
  }

  @Post(':id/void')
  @UsePipes(new ValidationPipe({ transform: true }))
  async voidBet(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason?: string,
  ): Promise<Bets> {
    return this.eventsService.voidBet(id, reason);
  }
}
