import { Module } from '@nestjs/common';
import { SportsApiService } from '../api/sports-api.service';
import { FootballController } from './controllers/football.controller';
import { FootballService } from './services/football.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [SportsApiService, FootballService],
  controllers: [FootballController],
  exports: [FootballService],
})
export class FootballModule {}
