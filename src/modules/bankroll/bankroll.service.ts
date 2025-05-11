import { Injectable } from '@nestjs/common';
import {
  CreateBankrollDTO,
  GetBankrollDTO,
  UpdateBankrollDTO,
} from './../../libs/common/dto/bankroll';
import {
  CreateBankrollService,
  DeleteBankrollService,
  FindBankrollService,
  UpdateBankrollService,
} from './services';

@Injectable()
export class BankrollService {
  constructor(
    private readonly createService: CreateBankrollService,
    private readonly readService: FindBankrollService,
    private readonly updateService: UpdateBankrollService,
    private readonly deleteService: DeleteBankrollService,
  ) {}

  async createBankroll(data: CreateBankrollDTO): Promise<GetBankrollDTO> {
    return await this.createService.createBankroll(data);
  }

  async findAllBankrolls(): Promise<GetBankrollDTO[]> {
    return await this.readService.findAllBankrolls();
  }

  async findBankrollById(id: number): Promise<GetBankrollDTO> {
    return await this.readService.findBankrollById(id);
  }

  async findBankrollsByUserId(userId: number): Promise<GetBankrollDTO[]> {
    return await this.readService.findBankrollsByUserId(userId);
  }

  async findBankrollByName(name: string): Promise<GetBankrollDTO | null> {
    return await this.readService.findBankrollByName(name);
  }

  async updateBankroll(
    id: number,
    data: UpdateBankrollDTO,
  ): Promise<GetBankrollDTO> {
    return await this.updateService.updateBankroll(id, data);
  }

  async deleteBankroll(id: number): Promise<GetBankrollDTO> {
    return await this.deleteService.deleteBankroll(id);
  }
}
