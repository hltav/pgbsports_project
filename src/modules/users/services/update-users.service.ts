import { Injectable, NotFoundException } from '@nestjs/common';
import { GetUserDTO, UpdateUserDTO } from './../../../libs';
import { PrismaService } from './../../../libs/database';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserUpdateService {
  constructor(private readonly prisma: PrismaService) {}

  async update(
    id: number,
    updateUser: Partial<UpdateUserDTO>,
  ): Promise<GetUserDTO> {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const dataToUpdate: Partial<UpdateUserDTO> = { ...updateUser };

    if (updateUser.password) {
      const saltRounds = 10;
      dataToUpdate.password = await bcrypt.hash(
        updateUser.password,
        saltRounds,
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: Number(id) },
      data: dataToUpdate,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        nickname: true,
        email: true,
      },
    });

    return updatedUser;
  }
}
