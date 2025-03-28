import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ClientData,
  CreateClientDataDto,
  UpdateClientDataDto,
} from '../../../libs/common/src';
import { PrismaService } from '../../../libs/database/src/prisma';

@Injectable()
export class ClientDataService {
  constructor(private prisma: PrismaService) {}

  // Método para criar ClientData
  async createClientData(
    createClientDataDto: CreateClientDataDto,
  ): Promise<ClientData> {
    const { address, ...clientDataData } = createClientDataDto;

    const createdClientData = await this.prisma.clientData.create({
      data: {
        ...clientDataData,
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

    return createdClientData as ClientData;
  }

  // Método para buscar ClientData por ID
  async getClientData(id: number): Promise<ClientData> {
    const clientData = await this.prisma.clientData.findUnique({
      where: { id },
      include: { address: true },
    });

    if (!clientData) {
      throw new NotFoundException(`ClientData com ID ${id} não encontrado.`);
    }

    return clientData as ClientData;
  }

  // Método para atualizar ClientData
  async updateClientData(
    id: number,
    updateClientDataDto: UpdateClientDataDto,
  ): Promise<ClientData> {
    const { address, ...clientDataData } = updateClientDataDto;

    // Verifica se o ClientData existe
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

    return updatedClientData as ClientData;
  }
}
