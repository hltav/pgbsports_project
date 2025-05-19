import { Injectable } from '@nestjs/common';
import { PrismaService } from './../../../libs/database';

@Injectable()
export class UpdateClientImageService {
  constructor(private prisma: PrismaService) {}

  async execute(id: number, imageUrl: string) {
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
