import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../libs/database/prisma';
import {
  CreateClientDataDTO,
  ClientDataDTO,
  UpdateClientDataDTO,
} from './../../libs/common/dto/client-data';

@Injectable()
export class ClientDataService {
  constructor(private prisma: PrismaService) {}

  async createClientData(
    createClientDataDto: CreateClientDataDTO,
  ): Promise<ClientDataDTO> {
    const { address, ...clientData } = createClientDataDto;

    const createdClientData = await this.prisma.clientData.create({
      data: {
        ...clientData,
        address: address
          ? {
              create: {
                ...address,
              },
            }
          : undefined,
      },
      include: {
        address: true,
      },
    });

    return createdClientData as ClientDataDTO;
  }

  async getClientData(id: number): Promise<ClientDataDTO> {
    const clientData = await this.prisma.clientData.findUnique({
      where: { id },
      include: { address: true },
    });

    if (!clientData) {
      throw new NotFoundException(`ClientData com ID ${id} não encontrado.`);
    }

    return clientData as ClientDataDTO;
  }

  async updateClientData(
    id: number,
    updateClientDataDto: UpdateClientDataDTO,
  ): Promise<ClientDataDTO> {
    const { address, ...clientDataData } = updateClientDataDto;

    const existingClientData = await this.prisma.clientData.findUnique({
      where: { id },
    });

    if (!existingClientData) {
      throw new NotFoundException(`ClientData com ID ${id} não encontrado.`);
    }

    const updatedClientData = await this.prisma.clientData.update({
      where: { id },
      data: {
        ...clientDataData,
        address: address
          ? {
              upsert: {
                create: { ...address },
                update: { ...address },
              },
            }
          : undefined,
      },
      include: {
        address: true,
      },
    });

    return updatedClientData as ClientDataDTO;
  }
}
