import {
  Controller,
  Post,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../libs';
import { Role } from '@prisma/client';
import { Request } from '../../../libs/common/interface/request.interface';
import { AdminJobRunnerService } from '../services/adminJobs.service';

// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(Role.SUPER_ADMIN)
// @Controller('admin/jobs/snapshots')
// export class AdminJobsController {
//   constructor(private readonly jobRunner: AdminJobRunnerService) {}

//   @Post('run/:type')
//   async runSnapshot(@Param('type') type: string, @Req() req: Request) {
//     const start = Date.now();

//     await this.jobRunner.runSnapshot(type);

//     return {
//       status: 'success',
//       job: type,
//       triggeredBy: req.user.id,
//       timestamp: new Date(),
//       durationMs: Date.now() - start,
//     };
//   }
// }

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('admin/jobs')
export class AdminJobsController {
  constructor(private readonly jobRunner: AdminJobRunnerService) {}

  @Post('snapshots/:type')
  async runSnapshot(
    @Param('type') type: string,
    @Req() req: Request,
    @Query('mode') mode: 'enqueue' | 'run' = 'enqueue',
    @Query('force') force?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('week') week?: string,
  ) {
    const start = Date.now();

    const allowedTypes = ['hourly', 'daily', 'weekly', 'monthly', 'yearly'];
    if (!allowedTypes.includes(type)) {
      throw new BadRequestException('Tipo de snapshot inválido');
    }

    if (!['enqueue', 'run'].includes(mode)) {
      throw new BadRequestException('Mode inválido (use enqueue ou run)');
    }

    const params = {
      year: year ? parseInt(year, 10) : undefined,
      month: month ? parseInt(month, 10) : undefined,
      week: week ? parseInt(week, 10) : undefined,
    };

    if (
      Object.values(params).some(
        (v) => v !== undefined && (Number.isNaN(v) || v < 0),
      )
    ) {
      throw new BadRequestException('year/month/week inválidos');
    }

    const result = await this.jobRunner.runSnapshot(type, {
      mode,
      params,
      force: force === 'true',
    });

    return {
      status: 'success',
      job: type,
      mode,
      triggeredBy: req.user.id,
      timestamp: new Date(),
      durationMs: Date.now() - start,
      result,
    };
  }
}
