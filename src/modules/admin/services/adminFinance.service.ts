import { Injectable } from '@nestjs/common';
import { UpdateBankrollService } from './../../../modules/bankroll/core/services/update-bankroll.service';
import { Decimal } from './../../../libs/database';

@Injectable()
export class AdminFinanceService {
  constructor(private readonly updateBankrollService: UpdateBankrollService) {}

  adjustBalance(bankrollId: number, amount: number, reason: string) {
    const decimalAmount = new Decimal(amount);

    return this.updateBankrollService.updateBankrollByEvent({
      bankrollId,
      type: decimalAmount.greaterThan(0) ? 'DEPOSIT' : 'WITHDRAWAL',
      amount: new Decimal(amount),
      description: reason,
    });
  }
}
