export interface HistoricalParams {
  season?: number;
  date?: string;
  from?: string;
  to?: string;
}

export interface LiveParams {
  live: string;
}

export interface TeamsParams {
  league: number;
  season: number;
}

export interface StandingsParams {
  league: number;
  season: number;
}

export interface NextFixturesParams {
  league: number;
  season: number;
  next: number;
}

export interface FixtureByIdParams {
  id: number | string;
  s?: number | string;
}

export interface FixtureByDateParams {
  date?: string;
  d?: string;
}

// Adiciona propriedades discriminantes para evitar ambiguidade
export type SportsApiParams =
  | (HistoricalParams & { type?: 'historical' })
  | (LiveParams & { type?: 'live' })
  | (TeamsParams & { type?: 'teams' })
  | (StandingsParams & { type?: 'standings' })
  | (FixtureByIdParams & { type?: 'fixture' })
  | (FixtureByDateParams & { type?: 'fixture' })
  | (NextFixturesParams & { type?: 'fixture' });
