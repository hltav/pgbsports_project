import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from './../../libs';

@Controller('predictions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PredictionsController {}
