import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../libs/database/prisma';
import {
  CreateClientDataDTO,
  ClientDataDTO,
  UpdateClientDataDTO,
} from './../../libs/common/dto/client-data';
import { UpdateClientDataSchema } from './../../libs/common/dto/client-data/update-client-data.dto';

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
    updateData: UpdateClientDataDTO,
  ): Promise<ClientDataDTO> {
    const validatedData = UpdateClientDataSchema.parse(updateData);

    const existingData = await this.prisma.clientData.findUnique({
      where: { id },
    });

    if (!existingData) {
      throw new NotFoundException(`Dados do cliente não encontrados`);
    }

    if (validatedData.image && Object.keys(validatedData).length === 1) {
      return this.prisma.clientData.update({
        where: { id },
        data: { image: validatedData.image },
      });
    }

    const { address, ...clientData } = validatedData;

    return this.prisma.clientData.update({
      where: { id },
      data: {
        ...clientData,
        address: address
          ? { upsert: { create: address, update: address } }
          : undefined,
      },
      include: { address: true },
    });
  }

  async updateClientImage(id: number, imageUrl: string) {
    const updated = await this.prisma.clientData.update({
      where: { id },
      data: { image: imageUrl },
      select: {
        id: true,
        image: true,
        updatedAt: true,
      },
    });

    return {
      ...updated,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
