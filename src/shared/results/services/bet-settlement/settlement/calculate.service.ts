import { Injectable, Logger } from '@nestjs/common';
import { Bets, Result } from '@prisma/client';
import { Decimal } from './../../../../../libs/database';

@Injectable()
export class CalculateARService {
  private readonly logger = new Logger(CalculateARService.name);

  constructor() {}

  calculateActualReturn(bet: Bets, result: Result): Decimal {
    const stakeUnits = new Decimal(bet.stake); // Ex: 1.00
    const unitValue = new Decimal(bet.unitValue); // Ex: 100.00
    const odd = new Decimal(bet.odd); // Ex: 1.95

    // Valor real investido (Ex: R$ 100.00)
    const monetaryStake = stakeUnits.mul(unitValue);

    switch (result) {
      case Result.win:
        // 1.00 * 100.00 * 1.95 = 195.00
        return monetaryStake.mul(odd);

      case Result.lose:
        return new Decimal(0);

      case Result.void:
      case Result.returned:
        // Devolve o valor monetário integral (R$ 100.00)
        return monetaryStake;

      default:
        return new Decimal(0);
    }
  }
}
