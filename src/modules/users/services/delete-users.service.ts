// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from './../../../libs/database';
// import { User } from './../../../libs/common/dto/user/user.schema';

// @Injectable()
// export class UserDeleteService {
//   constructor(private readonly prisma: PrismaService) {}

//   async delete(id: number): Promise<User> {
//     const user = await this.prisma.user.findUnique({
//       where: {
//         id: Number(id),
//       },
//     });

//     if (!user) {
//       throw new NotFoundException('User not Found!');
//     }

//     await this.prisma.emailVerification.deleteMany({
//       where: {
//         userId: Number(id),
//       },
//     });

//     await this.prisma.user.delete({
//       where: {
//         id: Number(id),
//       },
//     });

//     return user;
//   }
// }

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from './../../../libs/database';
import { Role } from '@prisma/client';
import { User } from './../../../libs/common/dto/user/user.schema';

@Injectable()
export class UserDeleteService {
  constructor(private readonly prisma: PrismaService) {}

  async delete(
    id: number,
    currentUser: { id: number; role: Role },
  ): Promise<User> {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found!');
    }

    // 🔐 SUPER_ADMIN pode tudo
    if (currentUser.role !== Role.SUPER_ADMIN) {
      // USER só pode deletar a si mesmo
      if (currentUser.role === Role.USER) {
        if (currentUser.id !== id) {
          throw new ForbiddenException('Você não pode deletar outro usuário');
        }
      }

      // ADMIN só pode deletar USER
      if (currentUser.role === Role.ADMIN) {
        if (targetUser.role !== Role.USER) {
          throw new ForbiddenException('ADMIN não pode deletar este usuário');
        }
      }
    }

    // 🔥 Segurança extra: nunca permitir deletar o último SUPER_ADMIN
    if (targetUser.role === Role.SUPER_ADMIN) {
      const superAdminCount = await this.prisma.user.count({
        where: { role: Role.SUPER_ADMIN },
      });

      if (superAdminCount <= 1) {
        throw new ForbiddenException(
          'Não é permitido remover o último SUPER_ADMIN',
        );
      }
    }

    // Idealmente isso deveria estar em uma transação
    await this.prisma.$transaction(async (tx) => {
      await tx.emailVerification.deleteMany({
        where: { userId: id },
      });

      await tx.user.delete({
        where: { id },
      });
    });

    return targetUser;
  }
}
