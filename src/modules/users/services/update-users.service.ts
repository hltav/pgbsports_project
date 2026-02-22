// import { Injectable, NotFoundException } from '@nestjs/common';
// import { GetUserDTO, UpdateUserDTO } from './../../../libs';
// import { PrismaService } from './../../../libs/database';
// import * as bcrypt from 'bcrypt';

// @Injectable()
// export class UserUpdateService {
//   constructor(private readonly prisma: PrismaService) {}

//   async update(
//     id: number,
//     updateUser: Partial<UpdateUserDTO>,
//   ): Promise<GetUserDTO> {
//     const user = await this.prisma.user.findUnique({
//       where: { id: Number(id) },
//     });

//     if (!user) {
//       throw new NotFoundException('User not found!');
//     }

//     const dataToUpdate: Partial<UpdateUserDTO> = { ...updateUser };

//     if (updateUser.password) {
//       const saltRounds = 10;
//       dataToUpdate.password = await bcrypt.hash(
//         updateUser.password,
//         saltRounds,
//       );
//     }

//     const updatedUser = await this.prisma.user.update({
//       where: { id: Number(id) },
//       data: dataToUpdate,
//       select: {
//         id: true,
//         firstname: true,
//         lastname: true,
//         nickname: true,
//         email: true,
//       },
//     });

//     return updatedUser;
//   }
// }

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { GetUserDTO, UpdateUserDTO } from './../../../libs';
import { PrismaService } from './../../../libs/database';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserUpdateService {
  constructor(private readonly prisma: PrismaService) {}

  async update(
    id: number,
    updateUser: Partial<UpdateUserDTO>,
    currentUser: { id: number; role: Role },
  ): Promise<GetUserDTO> {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found!');
    }

    // 🔐 SUPER_ADMIN pode tudo
    if (currentUser.role !== Role.SUPER_ADMIN) {
      // USER só pode alterar ele mesmo
      if (currentUser.role === Role.USER) {
        if (currentUser.id !== id) {
          throw new ForbiddenException('Você não pode alterar outro usuário');
        }
      }

      // ADMIN só pode alterar usuários comuns
      if (currentUser.role === Role.ADMIN) {
        if (targetUser.role !== Role.USER) {
          throw new ForbiddenException('ADMIN não pode alterar este usuário');
        }
      }
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
