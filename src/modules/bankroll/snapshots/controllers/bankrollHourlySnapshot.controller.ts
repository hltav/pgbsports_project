// import {
//   Controller,
//   Get,
//   Post,
//   Put,
//   Delete,
//   Param,
//   Body,
//   Query,
//   Req,
//   ParseIntPipe,
//   HttpCode,
//   HttpStatus,
//   UseGuards,
// } from '@nestjs/common';
// import { FastifyRequest } from 'fastify';
// import { CreateHourlySnapshotDTO } from '../dto/hourlySnapshot.dto';
// import { BankrollHourlySnapshotService } from '../services/bankrollHourlySnapshot.service';
// import { JwtAuthGuard, RolesGuard, Roles } from '../../../../libs';
// import { Role } from '@prisma/client';

// interface RequestWithUser extends FastifyRequest {
//   user: {
//     id: number;
//   };
// }

// @Controller('hourly')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(Role.USER, Role.TEST_USER)
// export class BankrollHourlySnapshotController {
//   constructor(
//     private readonly snapshotService: BankrollHourlySnapshotService,
//   ) {}

//   // Cria um novo snapshot horário
//   @Post()
//   async createSnapshot(
//     @Param('bankrollId', ParseIntPipe) bankrollId: number,
//     @Body() data: CreateHourlySnapshotDTO,
//     @Req() req: RequestWithUser,
//   ) {
//     const userId = req.user.id;

//     const snapshotData = { ...data, bankrollId };

//     return await this.snapshotService.createSnapshot(snapshotData, userId);
//   }

//   @Get()
//   async getSnapshots(
//     @Param('bankrollId', ParseIntPipe) bankrollId: number,
//     @Query('startDate') startDate: string | undefined,
//     @Query('endDate') endDate: string | undefined,
//     @Req() req: RequestWithUser,
//   ) {
//     const userId = req.user.id;

//     if (startDate && endDate) {
//       return await this.snapshotService.getSnapshotsByDateRange(
//         bankrollId,
//         new Date(startDate),
//         new Date(endDate),
//         userId,
//       );
//     }

//     return await this.snapshotService.getSnapshotsByBankroll(
//       bankrollId,
//       userId,
//     );
//   }

//   // Retorna o snapshot horário mais recente
//   @Get('latest')
//   async getLatestSnapshot(
//     @Param('bankrollId', ParseIntPipe) bankrollId: number,
//     @Req() req: RequestWithUser,
//   ) {
//     const userId = req.user.id;

//     return await this.snapshotService.getLatestSnapshot(bankrollId, userId);
//   }

//   @Get('bucket')
//   async getSnapshotByBucketStart(
//     @Param('bankrollId', ParseIntPipe) bankrollId: number,
//     @Query('bucketStart') bucketStart: string,
//     @Req() req: RequestWithUser,
//   ) {
//     const userId = req.user.id;

//     return await this.snapshotService.getSnapshotByBucketStart(
//       bankrollId,
//       new Date(bucketStart),
//       userId,
//     );
//   }

//   // Busca snapshot por ID
//   @Get('id/:snapshotId')
//   async getSnapshotById(
//     @Param('snapshotId', ParseIntPipe) snapshotId: number,
//     @Req() req: RequestWithUser,
//   ) {
//     const userId = req.user.id;

//     return await this.snapshotService.getSnapshotById(snapshotId, userId);
//   }

//   // Atualiza um snapshot existente
//   @Put(':snapshotId')
//   async updateSnapshot(
//     @Param('snapshotId', ParseIntPipe) snapshotId: number,
//     @Body() data: Partial<CreateHourlySnapshotDTO>,
//     @Req() req: RequestWithUser,
//   ) {
//     const userId = req.user.id;

//     return await this.snapshotService.updateSnapshot(snapshotId, data, userId);
//   }

//   // Deleta um snapshot específico
//   @Delete(':snapshotId')
//   @HttpCode(HttpStatus.NO_CONTENT)
//   async deleteSnapshot(
//     @Param('snapshotId', ParseIntPipe) snapshotId: number,
//     @Req() req: RequestWithUser,
//   ) {
//     const userId = req.user.id;

//     await this.snapshotService.deleteSnapshot(snapshotId, userId);
//   }

//   @Delete('range')
//   async deleteSnapshotsByDateRange(
//     @Param('bankrollId', ParseIntPipe) bankrollId: number,
//     @Query('startDate') startDate: string,
//     @Query('endDate') endDate: string,
//     @Req() req: RequestWithUser,
//   ) {
//     const userId = req.user.id;

//     const count = await this.snapshotService.deleteSnapshotsByDateRange(
//       bankrollId,
//       new Date(startDate),
//       new Date(endDate),
//       userId,
//     );

//     return {
//       message: `${count} snapshots entre ${startDate} e ${endDate} foram deletados`,
//       count,
//     };
//   }
// }

// bankroll-hourly-snapshot.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from './../../../../libs/utils/zodValidation.pipe';
import {
  CreateHourlySnapshotSchema,
  CreateHourlySnapshotDTO,
  GetHourlySnapshotDTO,
} from '../dto/hourlySnapshot.dto';
import { BankrollHourlySnapshotService } from '../services/bankrollHourlySnapshot.service';
import { JwtAuthGuard, RolesGuard } from './../../../../libs';

@Controller('hourly')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BankrollHourlySnapshotController {
  constructor(
    private readonly snapshotService: BankrollHourlySnapshotService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ZodValidationPipe(CreateHourlySnapshotSchema))
  async upsertSnapshot(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
    @Body() body: CreateHourlySnapshotDTO,
  ): Promise<void> {
    await this.snapshotService.upsertSnapshot({ ...body, bankrollId });
  }

  @Get()
  async findAll(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
  ): Promise<GetHourlySnapshotDTO[]> {
    return this.snapshotService.findAll(bankrollId);
  }

  @Get('cumulative-units')
  async getCumulativeUnits(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
  ): Promise<{ cumulativeUnits: string }> {
    const value =
      await this.snapshotService.getCurrentCumulativeUnits(bankrollId);
    return { cumulativeUnits: value.toString() };
  }

  @Post('recalculate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recalculateAll(
    @Param('bankrollId', ParseIntPipe) bankrollId: number,
  ): Promise<void> {
    await this.snapshotService.recalculateAll(bankrollId);
  }
}
