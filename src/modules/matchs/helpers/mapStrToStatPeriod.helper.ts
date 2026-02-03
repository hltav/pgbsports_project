import { StatPeriod } from '@prisma/client';

export function mapStrToStatPeriod(strPeriod: string): StatPeriod {
  if (!strPeriod) return StatPeriod.FULL_TIME; // fallback seguro

  const p = strPeriod.trim().toUpperCase();
  console.debug(`[mapStrToStatPeriod] raw=${strPeriod}, normalized=${p}`);

  // 1. FIRST_HALF (1º Tempo)
  if (
    p === '1H' ||
    p === 'FIRST HALF' ||
    p === '1ST HALF' ||
    p === 'FIRST_HALF' ||
    p.includes('FIRST') ||
    p.includes('1ST') ||
    p === 'H1'
  ) {
    return StatPeriod.FIRST_HALF;
  }

  // 2. SECOND_HALF (2º Tempo)
  if (
    p === '2H' ||
    p === 'SECOND HALF' ||
    p === '2ND HALF' ||
    p === 'SECOND_HALF' ||
    p.includes('SECOND') ||
    p.includes('2ND') ||
    p === 'H2'
  ) {
    return StatPeriod.SECOND_HALF;
  }

  // 3. FULL_TIME (Jogo Completo / Regular Time)
  if (
    p === 'FT' ||
    p === 'FULL TIME' ||
    p === 'FULL_TIME' ||
    p === 'REGULAR TIME' ||
    p === 'REGULAR_TIME' ||
    p === 'ALL' ||
    p === 'TOTAL' ||
    p === 'COMPLETE' ||
    p.includes('FULL') ||
    p.includes('REGULAR')
  ) {
    return StatPeriod.FULL_TIME;
  }

  // Fallback: assume que é o jogo completo (mais comum na API)
  console.warn(
    `[mapStrToStatPeriod] Unrecognized period: ${strPeriod}, defaulting to FULL_TIME`,
  );
  return StatPeriod.FULL_TIME;
}
