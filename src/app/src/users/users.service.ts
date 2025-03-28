/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { GetUserDTO, UpdateUserDTO } from '../../../libs/common/src';
import { PrismaService } from '../../../libs/database/src/prisma';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAllUsers(role?: Role): Promise<Partial<GetUserDTO>[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        firstname: true,
        lastname: true,
        nickname: true,
        email: true,
        role: true,
        clientData: {
          include: {
            address: true, // Inclui os dados do Address
          },
        },
      },
    });

    // Mapeia os usuários para o formato do DTO
    return users.map((user) => ({
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      nickname: user.nickname,
      email: user.email,
      role: user.role,
      clientData: user.clientData
        ? {
            ...user.clientData,
            address: user.clientData.address, // Inclui os dados do Address
          }
        : null,
    }));
  }

  async findUserById(
    id: number,
    role?: Role,
  ): Promise<Partial<GetUserDTO> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        nickname: true,
        email: true,
        role: true,
        clientData: {
          include: {
            address: true, // Inclui os dados do Address
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      nickname: user.nickname,
      email: user.email,
      role: user.role,
      clientData: user.clientData
        ? {
            ...user.clientData,
            address: user.clientData.address, // Inclui os dados do Address
          }
        : null,
    };
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
