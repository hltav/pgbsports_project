import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database';
import { ClientDataDTO, UpdateClientDataDTO } from '../dto';
import { UpdateClientDataSchema } from '../dto/update-client-data.dto';

@Injectable()
export class UpdateClientDataService {
  constructor(private prisma: PrismaService) {}

  async execute(
    id: number,
    update: UpdateClientDataDTO,
  ): Promise<ClientDataDTO> {
    const validated = UpdateClientDataSchema.parse(update);

    const existing = await this.prisma.clientData.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Dados do cliente não encontrados');
    }

    const { address, ...clientData } = validated;

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
}
