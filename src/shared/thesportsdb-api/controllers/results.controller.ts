import { Controller, Post, Param, ParseIntPipe } from '@nestjs/common';
import { ResultSchedulerService } from '../services/resultScheduler.service';
import { ResultUpdaterService } from '../services/resultUpdater.service';

@Controller('results')
export class ResultsController {
  constructor(
    private resultScheduler: ResultSchedulerService,
    private resultUpdater: ResultUpdaterService,
  ) {}

  @Post('update-all')
  async updateAllResults() {
    console.log('Trigger chamado pelo frontend');
    return this.resultScheduler.triggerManualUpdate();
  }

  @Post('update/:id')
  async updateEventResult(@Param('id', ParseIntPipe) id: number) {
    await this.resultUpdater.updateEventResult(id);
    return {
      message: `Event ${id} update triggered`,
      timestamp: new Date(),
    };
  }
}
