import { Controller, Post } from '@nestjs/common';
import { ResultSchedulerService } from '../services/resultScheduler.service';
// import { JwtAuthGuard, RolesGuard, Roles } from './../../../libs';

@Controller('admin/results')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('ADMIN')
export class ResultsController {
  constructor(private readonly resultScheduler: ResultSchedulerService) {}

  @Post('force-sync')
  async forceSyncAll() {
    return await this.resultScheduler.triggerManualUpdate();
  }

  @Post('force-api-sync') async forceApiSportsSync() {
    await this.resultScheduler.triggerApiSportsUpdate();
    return { message: 'API-Sports sync triggered', timestamp: new Date() };
  }
}
