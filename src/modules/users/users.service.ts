/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { PrismaService } from './../../libs/database/prisma';
import * as bcrypt from 'bcrypt';
import { GetUserDTO, UpdateUserDTO } from './../../libs/common/dto/user';
import { UserWithClientData } from './../../libs/common/dto/user/user-with-client-data.schema';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAllUsers(role?: Role): Promise<Partial<GetUserDTO>[]> {
    const users = await this.prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        nickname: true,
        email: true,
        role: true,
        clientData: {
          include: {
            address: true,
          },
        },
      },
    });

    return users.map((user) => ({
      ...user,
      clientData: user.clientData
        ? {
            ...user.clientData,
            address: user.clientData.address ?? undefined,
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
            address: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      clientData: user.clientData
        ? {
            ...user.clientData,
            address: user.clientData.address ?? undefined,
          }
        : null,
    };
  }

  async findOneByEmail(
    @Query('email') email: string,
  ): Promise<UserWithClientData | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        clientData: {
          include: {
            address: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      ...user,
      clientData: user.clientData
        ? {
            ...user.clientData,
            address: user.clientData.address ?? undefined,
          }
        : null,
    };
  }

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
