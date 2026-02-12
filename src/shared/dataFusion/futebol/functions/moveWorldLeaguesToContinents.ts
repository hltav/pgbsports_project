import { DiscoverLeague } from '../schemas/discoveryLeague.schema';
import { getInternationalTarget } from './getInternationalTarget';

export function moveWorldLeaguesToContinents(
  grouped: Record<string, DiscoverLeague[]>,
): void {
  const worldKey = 'Mundo';
  const worldLeagues = grouped[worldKey];
  if (!worldLeagues?.length) return;

  const remainingWorld: DiscoverLeague[] = [];

  for (const league of worldLeagues) {
    const target = getInternationalTarget(league);

    // se não está no mapa → fica em Mundo
    if (!target) {
      remainingWorld.push(league);
      continue;
    }

    // se o target ainda é Mundo, também fica
    if (target === worldKey) {
      remainingWorld.push(league);
      continue;
    }

    grouped[target] ??= [];
    grouped[target].push(league);
  }

  grouped[worldKey] = remainingWorld;
}
