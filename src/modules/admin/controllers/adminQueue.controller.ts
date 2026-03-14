import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  AdminJobStatus,
  AdminQueueName,
  AdminQueueService,
} from '../services/adminQueue.service';
import { Role } from '@prisma/client';
import { JwtAuthGuard, RolesGuard, Roles } from './../../../libs';
import { ADMIN_QUEUES, ADMIN_JOB_STATUS } from '../utils/adminQueue.types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('admin/queues')
export class AdminQueueController {
  constructor(private readonly adminQueueService: AdminQueueService) {}

  // 🔹 Cards de status
  @Get('overview')
  overview() {
    return this.adminQueueService.getOverview();
  }

  // 🔹 Jobs por fila/status
  @Get(':queue/jobs')
  jobs(
    @Param('queue') queue: string,
    @Query('status') status: string,
    @Query('limit') limit?: string,
  ) {
    if (!ADMIN_QUEUES.includes(queue as AdminQueueName)) {
      throw new BadRequestException('Invalid queue');
    }

    if (!ADMIN_JOB_STATUS.includes(status as AdminJobStatus)) {
      throw new BadRequestException('Invalid status');
    }

    return this.adminQueueService.getJobs(
      queue as AdminQueueName,
      status as AdminJobStatus,
      limit ? Number(limit) : 20,
    );
  }

  // 🔁 Retry
  @Post(':queue/jobs/:jobId/retry')
  retry(@Param('queue') queue: string, @Param('jobId') jobId: string) {
    if (!ADMIN_QUEUES.includes(queue as AdminQueueName)) {
      throw new BadRequestException('Invalid queue');
    }

    return this.adminQueueService.retryJob(queue as AdminQueueName, jobId);
  }

  // 🗑 Remove
  @Delete(':queue/jobs/:jobId')
  remove(@Param('queue') queue: string, @Param('jobId') jobId: string) {
    if (!ADMIN_QUEUES.includes(queue as AdminQueueName)) {
      throw new BadRequestException('Invalid queue');
    }

    return this.adminQueueService.removeJob(queue as AdminQueueName, jobId);
  }

  // ⏸ Pause
  @Post(':queue/pause')
  pause(@Param('queue') queue: string) {
    if (!ADMIN_QUEUES.includes(queue as AdminQueueName)) {
      throw new BadRequestException('Invalid queue');
    }

    return this.adminQueueService.pauseQueue(queue as AdminQueueName);
  }

  // ▶ Resume
  @Post(':queue/resume')
  resume(@Param('queue') queue: string) {
    if (!ADMIN_QUEUES.includes(queue as AdminQueueName)) {
      throw new BadRequestException('Invalid queue');
    }

    return this.adminQueueService.resumeQueue(queue as AdminQueueName);
  }
}
