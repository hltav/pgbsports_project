import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database';

@Injectable()
export class UpdateClientImageService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: number, imageUrl: string | null) {
    const clientData = await this.prisma.clientData.findUnique({
      where: { userId },
    });

    if (!clientData) {
      throw new NotFoundException('Client data not found');
    }

    const updated = await this.prisma.clientData.update({
      where: { id: clientData.id },
      data: {
        image: { set: imageUrl ?? undefined },
      },
      select: {
        id: true,
        image: true,
        updatedAt: true,
      },
    });

    return updated;
  }
}
