import { Decimal } from './../../../../libs/database/prisma/decimal';

export type PreviousHistoryData = {
  bankrollId: number;
  balanceAfter: Decimal;
  unidValueAfter: Decimal;
} | null;

export type PreviousSnapshotRow = {
  bankrollId: number;
  balance: Decimal;
  unidValue: Decimal;
  hourlyProfit: Decimal;
  hourlyROI: Decimal;
  unitsChange: Decimal;
  peakBalance: Decimal;
  maxDrawdown: Decimal;
  hourlyDrawdown: Decimal;
  drawdownPercent: Decimal;
  betsPlaced: number;
  betsWon: number;
  betsLost: number;
  winRate: Decimal;
} | null;

export type DecimalLike = Decimal | string | number;
