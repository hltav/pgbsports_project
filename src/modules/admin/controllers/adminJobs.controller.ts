import { Controller, Post, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../libs';
import { Role } from '@prisma/client';
import { Request } from '../../../libs/common/interface/request.interface';
import { AdminJobRunnerService } from '../services/adminJobs.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('admin/jobs/snapshots')
export class AdminJobsController {
  constructor(private readonly jobRunner: AdminJobRunnerService) {}

  @Post('run/:type')
  async runSnapshot(@Param('type') type: string, @Req() req: Request) {
    const start = Date.now();

    await this.jobRunner.runSnapshot(type);

    return {
      status: 'success',
      job: type,
      triggeredBy: req.user.id,
      timestamp: new Date(),
      durationMs: Date.now() - start,
    };
  }
}
