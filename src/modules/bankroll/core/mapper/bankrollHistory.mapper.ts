import { Decimal } from '../../../../libs/database';
import { GetBankrollHistoryDTO } from '../../z.dto';
import { BankrollHistoryDTO } from '../../z.dto/history/bankrollHistory.dto';

export class BankrollHistoryResponseMapper {
  private static money(value: Decimal | null | undefined): Decimal {
    return value ? value.toDecimalPlaces(2) : new Decimal(0);
  }

  private static safeDecimal(value: unknown): Decimal | null {
    if (value instanceof Decimal) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      try {
        return new Decimal(value);
      } catch {
        return null;
      }
    }
    return null;
  }

  static toDTO(history: BankrollHistoryDTO): GetBankrollHistoryDTO {
    const money = (v: unknown) =>
      BankrollHistoryResponseMapper.money(
        BankrollHistoryResponseMapper.safeDecimal(v) ?? undefined,
      );

    return {
      id: history.id,
      bankrollId: history.bankrollId,
      date: history.date,
      type: history.type,
      balanceBefore: money(history.balanceBefore),
      balanceAfter: money(history.balanceAfter),
      amount: money(history.amount),
      unidValueBefore: money(history.unidValueBefore),
      unidValueAfter: money(history.unidValueAfter),
      betId: history.eventId ?? undefined,
      description: history.description ?? undefined,
      bets: history.bets
        ? {
            eventDescription: history.bets.eventDescription,
            stake: money(history.bets.stake),
            odd: money(history.bets.odd),
            potentialReturn: money(history.bets.potentialReturn),
            actualReturn: money(history.bets.actualReturn),
          }
        : undefined,
    };
  }
}
