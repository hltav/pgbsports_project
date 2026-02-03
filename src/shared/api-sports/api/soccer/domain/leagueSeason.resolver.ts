import { Season } from '../schemas/leagues/leagues.schema';

export function resolveLeagueSeason(seasons: Season[]): number {
  if (!seasons?.length) {
    throw new Error('League has no seasons');
  }

  const current = seasons.find((s) => s.current);
  if (current) return current.year;

  return Math.max(...seasons.map((s) => s.year));
}
