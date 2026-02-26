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

const SEASON_PRE_START_MS = CACHE_TTL.THREE_MONTHS;
const SEASON_POST_END_MS = CACHE_TTL.THREE_MONTHS;

export function isActiveSeasonNow(
  season: ApiSportsSeason,
  seasonRange?: string,
): boolean {
  if (!season?.start || !season?.end) return false;

  const start = new Date(season.start);
  const end = new Date(season.end);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

  const now = new Date();
  const currentYear = now.getFullYear();

  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  // 1️⃣ Match por range textual (TSDB)
  if (seasonRange) {
    const match = seasonRange.match(/(\d{4})[^\d]?(\d{4})?/);

    if (match) {
      const rangeStart = Number(match[1]);
      const rangeEnd = match[2] ? Number(match[2]) : rangeStart;

      if (currentYear >= rangeStart && currentYear <= rangeEnd) {
        return true;
      }
    }
  }

  // 2️⃣ Match por ano do start/end (🔥 agora usando as variáveis)
  if (currentYear >= startYear && currentYear <= endYear) {
    return true;
  }

  // 3️⃣ API current flag
  if (season.current === true) {
    const endWithGrace = new Date(end.getTime() + SEASON_POST_END_MS);
    return now <= endWithGrace;
  }

  // 4️⃣ Janela com grace
  const startWithGrace = new Date(start.getTime() - SEASON_PRE_START_MS);
  const endWithGrace = new Date(end.getTime() + SEASON_POST_END_MS);

  return now >= startWithGrace && now <= endWithGrace;
}

export function getBestActiveSeason(
  seasons: ApiSportsSeason[],
): ApiSportsSeason | null {
  if (!seasons?.length) return null;

  // Prioridade 1: current: true + dentro da janela
  const currentAndActive = seasons.find(
    (s) => s.current === true && isActiveSeasonNow(s),
  );
  if (currentAndActive) return currentAndActive;

  // Prioridade 2: dentro da janela temporal (mesmo sem current: true)
  const activeByWindow = seasons.find((s) => isActiveSeasonNow(s));
  if (activeByWindow) return activeByWindow;

  // Prioridade 3: current: true mesmo fora da janela (API pode estar atrasada)
  const currentOnly = seasons.find((s) => s.current === true);
  if (currentOnly) return currentOnly;

  return null;
}
