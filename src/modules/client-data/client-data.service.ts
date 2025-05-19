import { Injectable } from '@nestjs/common';
import {
  CreateClientDataService,
  GetClientDataService,
  UpdateClientDataService,
  UpdateClientImageService,
} from './services';
import { CreateClientDataDTO, ClientDataDTO, UpdateClientDataDTO } from './dto';
@Injectable()
export class ClientDataService {
  constructor(
    private readonly createClientDataService: CreateClientDataService,
    private readonly getClientDataService: GetClientDataService,
    private readonly updateClientDataService: UpdateClientDataService,
    private readonly updateClientImageService: UpdateClientImageService,
  ) {}

  async createClientData(
    createClientDataDto: CreateClientDataDTO,
  ): Promise<ClientDataDTO> {
    return this.createClientDataService.execute(createClientDataDto);
  }

  async getClientData(id: number): Promise<ClientDataDTO> {
    return this.getClientDataService.execute(id);
  }

  async updateClientData(
    id: number,
    updateData: UpdateClientDataDTO,
  ): Promise<ClientDataDTO> {
    return this.updateClientDataService.execute(id, updateData);
  }

  async updateClientImage(id: number, imageUrl: string) {
    return this.updateClientImageService.execute(id, imageUrl);
  }
}
