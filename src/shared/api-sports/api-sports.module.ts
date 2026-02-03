import { Module } from '@nestjs/common';
import { SoccerModule } from './api/soccer/soccer.module';

@Module({
  imports: [SoccerModule],
  exports: [SoccerModule],
})
export class ApiSportsModule {}
