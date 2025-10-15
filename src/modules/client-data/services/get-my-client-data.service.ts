import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientDataDTO } from '../dto';
import { PrismaService } from './../../../libs/database';

@Injectable()
export class GetMyClientDataService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: number): Promise<ClientDataDTO> {
    const clientData = await this.prisma.clientData.findUnique({
      where: { userId },
      include: { address: true },
    });
    console.log('clientData', clientData);

    if (!clientData) {
      throw new NotFoundException(
        `Dados do usuário ${userId} não encontrados.`,
      );
    }

    return clientData as ClientDataDTO;
  }
}
