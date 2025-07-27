import { Injectable } from '@nestjs/common';
import { PrismaService } from './../../../libs/database/prisma/prisma.service';
import { ClientDataDTO, CreateClientDataDTO } from '../dto';

@Injectable()
export class CreateClientDataService {
  constructor(private prisma: PrismaService) {}

  async execute(data: CreateClientDataDTO): Promise<ClientDataDTO> {
    const { address, ...clientData } = data;

    const created = await this.prisma.clientData.create({
      data: {
        ...clientData,
        address: address ? { create: address } : undefined,
      },
      include: { address: true },
    });

    return created as ClientDataDTO;
  }
}
