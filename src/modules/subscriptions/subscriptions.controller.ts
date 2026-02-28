import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from './../../libs';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {}
