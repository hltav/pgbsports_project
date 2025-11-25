import { Result } from '@prisma/client';

export interface EventMarketAnalysis {
  result: Result;
  shouldUpdate: boolean;
  isFinalizableEarly?: boolean;
  isMatchFinished?: boolean;
}

export function noUpdate(): EventMarketAnalysis {
  return { result: Result.pending, shouldUpdate: false };
}

export function voidResult(): EventMarketAnalysis {
  return { result: Result.void, shouldUpdate: true };
}
