import { Module } from '@nestjs/common';
import { SoccerModule } from './endpoints/soccer/soccer.module';

@Module({
  imports: [SoccerModule],
  exports: [SoccerModule],
})
export class ApiSportsModule {}
