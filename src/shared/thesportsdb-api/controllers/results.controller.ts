import { Controller, Post, Param, ParseIntPipe } from '@nestjs/common';
import { ResultSchedulerService } from '../services/resultScheduler.service';
import { ResultUpdaterService } from '../services/resultUpdater.service';

@Controller('results')
export class ResultsController {
  constructor(
    private resultScheduler: ResultSchedulerService,
    private resultUpdater: ResultUpdaterService,
  ) {}

  // Trigger manual para atualizar todos os eventos pendentes
  @Post('update-all')
  async updateAllResults() {
    return this.resultScheduler.triggerManualUpdate();
  }

  // Atualizar um evento específico
  @Post('update/:id')
  async updateEventResult(@Param('id', ParseIntPipe) id: number) {
    await this.resultUpdater.updateEventResult(id);
    return {
      message: `Event ${id} update triggered`,
      timestamp: new Date(),
    };
  }
}
