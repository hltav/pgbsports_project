import { Decimal } from './../../../../libs/database/prisma/decimal';

export type PreviousSnapshotData = {
  balanceAfter: Decimal;
  unidValueAfter: Decimal;
} | null;

export type HourlySnapshotRow = {
  bankrollId: number;
  bucketStart: Date;
  balance: Decimal;
  unidValue: Decimal;
  hourlyProfit: Decimal;
  betsPlaced: number;
  betsWon: number;
  betsLost: number;
};

export type PreviousHourlyStateRow = {
  bankrollId: number;
  balance: Decimal;
  unidValue: Decimal;
};
