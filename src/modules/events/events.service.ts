import { Injectable } from '@nestjs/common';
import { Bets, $Enums } from '@prisma/client';
import { CreateBetDTO, UpdateBetDTO } from './dto/create-event.dto';
import { CreateBetService } from './services/createBet.service';
import { DeleteBetService } from './services/deleteBet.service';
import { GetBetService } from './services/getBet.service';
import { UpdateBetService } from './services/updateBet.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly createService: CreateBetService,
    private readonly updateService: UpdateBetService,
    private readonly deleteService: DeleteBetService,
    private readonly getService: GetBetService,
  ) {}

  // ==================== CREATE ====================
  async createBet(data: CreateBetDTO, userId: number): Promise<Bets> {
    return this.createService.createBet(data, userId);
  }

  // ==================== READ ====================
  async getBetById(id: number): Promise<Bets> {
    return this.getService.getBetById(id);
  }

  async getBetsByUser(userId: number): Promise<Bets[]> {
    return this.getService.getBetsByUser(userId);
  }

  async getBetsByBankroll(bankrollId: number): Promise<Bets[]> {
    return this.getService.getBetsByBankroll(bankrollId);
  }

  async getBetsWithFilters(filters: {
    userId?: number;
    bankrollId?: number;
    result?: $Enums.Result;
    sport?: string;
  }): Promise<Bets[]> {
    return this.getService.getBetsWithFilters(filters);
  }

  // ==================== UPDATE ====================
  async updateBet(data: UpdateBetDTO): Promise<Bets> {
    return this.updateService.updateBet(data);
  }

  // ==================== DELETE ====================
  async deleteBet(
    betId: number,
  ): Promise<{ message: string; deletedBet: Bets }> {
    return this.deleteService.deleteBet(betId);
  }

  async deleteBets(betIds: number[]): Promise<{
    message: string;
    deletedCount: number;
    errors: Array<{ betId: number; error: string }>;
  }> {
    return this.deleteService.deleteBets(betIds);
  }

  async voidBet(betId: number, reason?: string): Promise<Bets> {
    return this.deleteService.voidBet(betId, reason);
  }
}
