import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
// import { prisma } from './prisma.client';

// @Injectable()
// export class PrismaService implements OnModuleInit, OnModuleDestroy {
//   async onModuleInit() {
//     await prisma.$connect();
//   }

//   async onModuleDestroy() {
//     await prisma.$disconnect();
//   }

//   // Retorna diretamente o PrismaClient, permitindo acessar 'user' e outros modelos
//   get user() {
//     return prisma.user;
//   }

//   get client() {
//     return prisma; // Permite acessar todos os métodos do PrismaClient
//   }
// }
