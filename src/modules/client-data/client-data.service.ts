import { Injectable } from '@nestjs/common';
import {
  CreateClientDataService,
  GetClientDataService,
  GetMyClientDataService,
  UpdateClientDataService,
  UpdateClientImageService,
} from './services';
import { CreateClientDataDTO, ClientDataDTO, UpdateClientDataDTO } from './dto';
@Injectable()
export class ClientDataService {
  constructor(
    private readonly createClientDataService: CreateClientDataService,
    private readonly myGetClientDataService: GetMyClientDataService,
    private readonly getClientDataService: GetClientDataService,
    private readonly updateClientDataService: UpdateClientDataService,
    private readonly updateClientImageService: UpdateClientImageService,
  ) {}

  async createClientData(
    createClientDataDto: CreateClientDataDTO,
  ): Promise<ClientDataDTO> {
    return this.createClientDataService.execute(createClientDataDto);
  }

  async upsertClientData(
    userId: number,
    dto: CreateClientDataDTO,
  ): Promise<ClientDataDTO> {
    const existing = await this.myGetClientDataService.execute(userId);

    if (existing) {
      return this.updateClientDataService.execute(existing.id, dto);
    }

    return this.createClientDataService.execute({
      ...dto,
      userId,
    });
  }

  async getMyClientData(userId: number): Promise<ClientDataDTO> {
    return this.myGetClientDataService.execute(userId);
  }

  async getClientData(id: number): Promise<ClientDataDTO> {
    return this.getClientDataService.execute(id);
  }

  async updateClientDataByUser(
    userId: number,
    dto: UpdateClientDataDTO,
  ): Promise<ClientDataDTO> {
    const existing = await this.myGetClientDataService.execute(userId);

    return this.updateClientDataService.execute(existing.id, dto);
  }

  async updateClientData(
    id: number,
    updateData: UpdateClientDataDTO,
  ): Promise<ClientDataDTO> {
    return this.updateClientDataService.execute(id, updateData);
  }

  async updateClientImage(id: number, imageUrl: string | null) {
    return this.updateClientImageService.execute(id, imageUrl);
  }
}
