import { Injectable } from '@nestjs/common';
import {
  CreateBankrollDTO,
  GetBankrollDTO,
  UpdateBankrollDTO,
  PatchBankrollDTO,
} from './z.dto';
import { CreateBankrollService } from './core/services/create-bankroll.service';
import { DeleteBankrollService } from './core/services/delete-bankroll.service';
import { FindBankrollService } from './core/services/find-bankroll.service';
import { UpdateBankrollService } from './core/services/update-bankroll.service';

@Injectable()
export class BankrollService {
  constructor(
    private readonly createService: CreateBankrollService,
    private readonly readService: FindBankrollService,
    private readonly updateService: UpdateBankrollService,
    private readonly deleteService: DeleteBankrollService,
  ) {}

  async createBankroll(data: CreateBankrollDTO): Promise<GetBankrollDTO> {
    return this.createService.createBankroll(data);
  }

  async findAllBankrolls(): Promise<GetBankrollDTO[]> {
    return this.readService.findAllBankrolls();
  }

  async findBankrollById(id: number, userId: number): Promise<GetBankrollDTO> {
    return this.readService.findBankrollById(id, userId);
  }

  async findBankrollsByUserId(userId: number): Promise<GetBankrollDTO[]> {
    return this.readService.findBankrollsByUserId(userId);
  }

  async findBankrollByName(name: string): Promise<GetBankrollDTO | null> {
    return this.readService.findBankrollByName(name);
  }

  async updateBankroll(
    id: number,
    data: UpdateBankrollDTO,
  ): Promise<GetBankrollDTO> {
    return this.updateService.updateBankroll(id, data);
  }

  async patchUpdateBankroll(
    id: number,
    data: PatchBankrollDTO,
  ): Promise<GetBankrollDTO> {
    return this.updateService.patchUpdateBankroll(id, data);
  }

  async deleteBankroll(id: number): Promise<GetBankrollDTO> {
    return this.deleteService.deleteBankroll(id);
  }
}
