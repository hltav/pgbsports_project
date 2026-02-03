import { MatchStatus } from '@prisma/client';

export function mapStrStatusToMatchStatus(strStatus: string): MatchStatus {
  if (!strStatus) return MatchStatus.NOT_STARTED;

  const s = strStatus.trim().toUpperCase();

  // 1. NÃO INICIADO
  if (s === 'NS' || s === 'TBD' || s.includes('NOT STARTED')) {
    return MatchStatus.NOT_STARTED;
  }

  // 2. EM ANDAMENTO
  if (s === '1H' || s.includes('FIRST HALF') || s.includes('KICK OFF')) {
    return MatchStatus.FIRST_HALF;
  }

  if (s === 'HT' || s.includes('HALFTIME')) {
    return MatchStatus.HALF_TIME;
  }

  if (s === '2H' || s.includes('SECOND HALF')) {
    return MatchStatus.SECOND_HALF;
  }

  if (
    s === 'ET' ||
    s === 'P' ||
    s === 'BT' ||
    s.includes('EXTRA TIME') ||
    s.includes('PENALTY')
  ) {
    return MatchStatus.LIVE;
  }

  // 3. FINALIZADO
  if (
    s === 'FT' ||
    s === 'AET' ||
    s === 'PEN' ||
    s.includes('MATCH FINISHED') ||
    s.includes('FULL TIME') ||
    s === 'FINISHED'
  ) {
    return MatchStatus.FINISHED;
  }

  // 4. ADIADO
  if (s === 'PST' || s.includes('POSTPONED')) {
    return MatchStatus.POSTPONED;
  }

  // 5. CANCELADO / ABANDONADO
  if (
    s === 'CANC' ||
    s === 'ABD' ||
    s === 'SUSP' ||
    s === 'INT' ||
    s === 'AWD' ||
    s === 'WO' ||
    s.includes('CANCELLED') ||
    s.includes('ABANDONED') ||
    s.includes('INTERRUPTED')
  ) {
    return MatchStatus.CANCELLED;
  }

  // Fallback seguro
  return MatchStatus.LIVE;
}
