import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database';
import { User } from './../../../libs/common/dto/user/user.schema';

@Injectable()
export class UserDeleteService {
  constructor(private readonly prisma: PrismaService) {}

  async delete(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!user) {
      throw new NotFoundException('User not Found!');
    }

    await this.prisma.user.delete({
      where: {
        id: Number(id),
      },
    });

    return user;
  }
}
