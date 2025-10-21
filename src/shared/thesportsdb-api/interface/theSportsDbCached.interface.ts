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

export type SportsApiParams =
  | HistoricalParams
  | LiveParams
  | TeamsParams
  | StandingsParams;
