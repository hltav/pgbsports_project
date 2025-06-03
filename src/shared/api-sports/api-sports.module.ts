import { Module } from '@nestjs/common';
import { FootballModule } from './football/football.module';

@Module({
  imports: [FootballModule],
  exports: [FootballModule],
})
export class ApiSportsModule {}
