import { CACHE_TTL } from './../../../libs/utils/cache.constants';

export interface ApiSportsSeason {
  start?: string | null;
  end?: string | null;
  current?: boolean;
  coverage?: {
    fixtures?: {
      events?: boolean;
    };
  };
}

const SEASON_PRE_START_MS = CACHE_TTL.ONE_MONTH;
const SEASON_POST_END_MS = CACHE_TTL.TWO_MONTH;

export function isActiveSeasonNow(season: ApiSportsSeason): boolean {
  if (!season?.start || !season?.end) return false;

  const start = new Date(season.start);
  const end = new Date(season.end);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

  const now = new Date();

  // Se a API marca como current, confia nela (desde que não tenha terminado há muito tempo)
  if (season.current === true) {
    const endWithGrace = new Date(end.getTime() + SEASON_POST_END_MS);
    return now <= endWithGrace; // Aceita se ainda não passou do fim + graça
  }

  // Para temporadas não marcadas como current, usa lógica de janela temporal
  const startWithGrace = new Date(start.getTime() - SEASON_PRE_START_MS);
  const endWithGrace = new Date(end.getTime() + SEASON_POST_END_MS);

  return now >= startWithGrace && now <= endWithGrace;
}
