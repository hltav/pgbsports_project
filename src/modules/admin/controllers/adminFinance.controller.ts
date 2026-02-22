import { UseGuards, Controller, Post, Param, Body } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard, RolesGuard, Roles } from './../../../libs';
import { AdminFinanceService } from '../services/adminFinance.service';
import { AdjustBalanceDto } from '../schemas/finance.schema';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/finance')
export class AdminFinanceController {
  constructor(private readonly adminFinanceService: AdminFinanceService) {}

  @Post('bankroll/:id/adjust')
  adjustBalance(@Param('id') id: number, @Body() dto: AdjustBalanceDto) {
    return this.adminFinanceService.adjustBalance(id, dto.amount, dto.reason);
  }
}
