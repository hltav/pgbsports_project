import { BadRequestException } from '@nestjs/common';

export function parseSeason(season?: string): number | 'current' | undefined {
  if (!season) return undefined;
  if (season === 'current') return 'current';

  const year = Number(season);
  if (Number.isNaN(year)) {
    throw new BadRequestException('season must be a number or "current"');
  }

  return year;
}
