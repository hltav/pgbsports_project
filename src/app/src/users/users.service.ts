import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUserDTO, UpdateUserDTO } from '../../../libs/common/src';
import { PrismaService } from '../../../libs/database/src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAllUsers(): Promise<Partial<GetUserDTO>[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        firstname: true,
        lastname: true,
        nickname: true,
        email: true,
        role: true,
      },
    });
  }

  async findUserById(id: number): Promise<Partial<GetUserDTO> | null> {
    return this.prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        firstname: true,
        lastname: true,
        nickname: true,
        email: true,
      },
    });
  }

  async findOneByEmail(@Query('email') email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    return user;
  }

  async findOneByNicknameOrEmail(identifier: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ nickname: identifier }, { email: identifier }],
      },
    });
    return user;
  }

  async update(
    id: number,
    updateUser: Partial<UpdateUserDTO>,
  ): Promise<GetUserDTO> {
    // Verifica se o usuário existe
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
