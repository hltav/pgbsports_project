import { Decimal } from '../../../../libs/database';
import { GetBankrollDTO, GetBankrollHistoryDTO } from '../../z.dto';

type BankrollWithHistory = GetBankrollDTO & {
  histories: GetBankrollHistoryDTO[];
};

export class BankrollResponseMapper {
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

  static toDTO(bankroll: BankrollWithHistory): GetBankrollDTO {
    const money = (v: unknown) =>
      BankrollResponseMapper.money(
        BankrollResponseMapper.safeDecimal(v) ?? undefined,
      );

    const histories = bankroll.histories.map((h) => ({
      ...h,
      balanceBefore: money(h.balanceBefore),
      balanceAfter: money(h.balanceAfter),
      amount: money(h.amount),
      unidValueBefore: money(h.unidValueBefore),
      unidValueAfter: money(h.unidValueAfter),
      bets: h.bets
        ? {
            eventDescription: h.bets.eventDescription,
            stake: money(h.bets.stake),
            odd: money(h.bets.odd),
            potentialReturn: money(h.bets.potentialReturn),
            actualReturn: money(h.bets.actualReturn),
          }
        : undefined,
    }));

    const lastHistory = histories[0];

    return {
      id: bankroll.id,
      userId: bankroll.userId,
      name: bankroll.name,
      bookmaker: bankroll.bookmaker,
      balance: money(bankroll.balance),
      unidValue: money(bankroll.unidValue),
      initialBalance: money(bankroll.initialBalance),
      totalDeposited: money(bankroll.totalDeposited),
      totalWithdrawn: money(bankroll.totalWithdrawn),
      totalStaked: money(bankroll.totalStaked),
      totalReturned: money(bankroll.totalReturned),
      lastHistory,
      histories,
    };
  }
}
