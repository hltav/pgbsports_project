/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Query } from '@nestjs/common';
import { GetUserDTO } from './../../../libs';
import { PrismaService } from './../../../libs/database';
import { UserWithClientData } from './../../../libs';
import { Role } from './../../../libs/common/enum/role.enum';

@Injectable()
export class UserFindService {
  constructor(private readonly prisma: PrismaService) {}

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
}
