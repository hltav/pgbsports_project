export type ExternalEventRef =
  | { source: 'api-sports'; apiSportsEventId: string }
  | { source: 'tsdb'; tsdbEventId: string };
