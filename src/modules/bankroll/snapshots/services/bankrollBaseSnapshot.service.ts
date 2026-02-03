// import { Prisma } from '@prisma/client';
// import { PrismaService } from '../../../../libs/database';

// export abstract class BankrollBaseSnapshotService<TModel> {
//   constructor(
//     protected readonly prisma: PrismaService,
//     protected readonly table: Prisma.DailySnapshotDelegate,
//   ) {}

//   async createSnapshot(data: Prisma.DailySnapshotCreateInput): Promise<TModel> {
//     return (await this.table.create({ data })) as unknown as TModel;
//   }

//   async updateSnapshot(
//     where: Prisma.DailySnapshotWhereUniqueInput,
//     data: Prisma.DailySnapshotUpdateInput,
//   ): Promise<TModel> {
//     return (await this.table.update({ where, data })) as unknown as TModel;
//   }

//   async findSnapshot(
//     where: Prisma.DailySnapshotWhereUniqueInput,
//   ): Promise<TModel | null> {
//     return (await this.table.findUnique({ where })) as unknown as TModel | null;
//   }

//   async findSnapshots(
//     where?: Prisma.DailySnapshotWhereInput,
//   ): Promise<TModel[]> {
//     return (await this.table.findMany({ where })) as unknown as TModel[];
//   }
// }
