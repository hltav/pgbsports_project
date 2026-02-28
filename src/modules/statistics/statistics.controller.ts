import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from './../../libs';

@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatisticsController {}
