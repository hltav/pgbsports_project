import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database';
import { ClientDataDTO } from '../dto';

@Injectable()
export class GetClientDataService {
  constructor(private prisma: PrismaService) {}

  async execute(id: number): Promise<ClientDataDTO> {
    const clientData = await this.prisma.clientData.findUnique({
      where: { id },
      include: { address: true },
    });

    if (!clientData) {
      throw new NotFoundException(`ClientData com ID ${id} não encontrado.`);
    }

    return clientData as ClientDataDTO;
  }
}
